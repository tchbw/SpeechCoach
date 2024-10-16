import { prisma } from "@/server/init/db";
import { hasProjectPerm } from "@/server/services/authorization/service";
import { ProjectAction } from "@/server/services/authorization/types";
import { BaseService } from "@/server/services/BaseService";
import type { ProjectDocumentWithDefaults } from "@/server/services/project/model";
import { RAGProvider } from "@/server/services/rag/providers";
import type { RetrievedRagChunk } from "@/server/services/rag/types";

export class RagService extends BaseService {
  async ingestRagDocuments({
    documents,
    projectId,
  }: {
    documents: Array<{
      s3Key: string;
      name: string;
    }>;
    projectId: string;
  }) {
    const project = await prisma.project.findUniqueOrThrow({
      where: {
        id: projectId,
      },
    });
    await hasProjectPerm(this.ctx, [ProjectAction.UPLOAD_DOCUMENT], project);

    const ragProvider = RAGProvider.getProvider(project.ragProvider);

    const projectDocuments: ProjectDocumentWithDefaults[] = [];
    for (const document of documents) {
      const { projectDocument } = await ragProvider.ingestRagDocument({
        document,
        projectId,
      });
      projectDocuments.push(projectDocument);
    }
    return { projectDocuments };
    // const presignedGetUrl = await fileService.getPresignedUrlForFile({
    //   path: documentKey,
    //   action: `read`,
    //   bucket: FILES.RAG_DOCUMENT_BUCKET,
    //   expires: 1,
    //   expiresUnit: `days`,
    // });

    // return prisma.ragDocument.create({
    //   data: {
    //     key: documentKey,
    //     companyId,
    //     uploadedByUserId: userId,
    //   },
    // });
  }

  /**
   * Retrieves relevant RAG chunks for a given query
   * @param param0
   * @returns
   */
  async retrieveDocuments({
    projectId,
    query,
    providerDocumentId,
  }: {
    projectId: string;
    query: string;
    providerDocumentId?: string;
  }): Promise<RetrievedRagChunk[]> {
    const project = await prisma.project.findUniqueOrThrow({
      where: {
        id: projectId,
      },
    });
    await hasProjectPerm(this.ctx, [ProjectAction.VIEW_DOCUMENTS], project);

    const ragProvider = RAGProvider.getProvider(project.ragProvider);
    return ragProvider.retrieveDocuments({
      projectId,
      query,
      providerDocumentId,
    });
  }

  /**
   * Checks that the thread document has been ingested fully into RAG provider
   * @param param0
   * @returns
   */
  async isThreadReadyForQuery({
    projectId,
    threadId,
  }: {
    projectId: string;
    threadId: string;
  }): Promise<boolean> {
    const project = await prisma.project.findUniqueOrThrow({
      where: {
        id: projectId,
      },
    });
    await hasProjectPerm(this.ctx, [ProjectAction.VIEW_DOCUMENTS], project);

    const chatThread = await prisma.chatMessageThread.findUniqueOrThrow({
      where: {
        id: threadId,
      },
      include: {
        Document: true,
      },
    });
    const ragProvider = RAGProvider.getProvider(project.ragProvider);
    return ragProvider.isDocumentReadyForQuery({
      providerDocumentId: chatThread.Document.ragProviderDocumentId,
    });
  }
}
