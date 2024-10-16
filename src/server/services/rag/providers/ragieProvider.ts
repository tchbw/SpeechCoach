import { env } from "@/env";
import { logger } from "@/init/logger";
import ragie from "@/init/ragie";
import { prisma } from "@/server/init/db";
import { fileService } from "@/server/services/file/service";
import { projectDocumentModelDefaultInclude } from "@/server/services/project/model";
import ragieApi from "@/server/services/rag/api";
import type { RAGProvider } from "@/server/services/rag/providers";
import type { RetrievedRagChunk } from "@/server/services/rag/types";

class RagieProvider implements RAGProvider {
  async retrieveDocuments({
    projectId,
    query,
    providerDocumentId,
  }: {
    projectId: string;
    query: string;
    providerDocumentId?: string;
  }): Promise<RetrievedRagChunk[]> {
    const result = await ragie.retrievals.retrieve({
      query,
      topK: 8,
      filter: {
        projectId: {
          $eq: projectId,
        },
        document_id: {
          $eq: providerDocumentId,
        },
      },
      rerank: true,
      // maxChunksPerDocument: 3,
    });

    return result.scoredChunks.map((chunk) => ({
      text: chunk.text,
      providerDocumentId: chunk.documentId,
    }));
  }

  async ingestRagDocument({
    document,
    projectId,
  }: {
    document: {
      s3Key: string;
      name: string;
    };
    projectId: string;
  }) {
    const presignedGetUrl = await fileService.getPresignedUrlForFile({
      path: document.s3Key,
      action: `read`,
      bucket: env.AWS_S3_BUCKET,
      expires: 1,
      expiresUnit: `days`,
    });

    const projectDocument = await prisma.$transaction(async (tx) => {
      const response = await ragieApi.createDocumentFromUrl({
        mode: `hi_res`,
        name: document.name,
        url: presignedGetUrl,
        // This is important to tie a project to a document
        metadata: {
          projectId,
        },
      });
      logger.info({ response }, `ragie response`);

      return await tx.projectDocument.create({
        data: {
          name: document.name,
          projectId,
          // status: RAGDocumentStatus.PROCESSING,
          s3Key: document.s3Key,
          ragProviderDocumentId: response.id,
        },
        include: projectDocumentModelDefaultInclude,
      });
    });

    return {
      projectDocument,
    };
  }

  async isDocumentReadyForQuery({
    providerDocumentId,
  }: {
    providerDocumentId: string;
  }): Promise<boolean> {
    const document = await ragie.documents.get({
      documentId: providerDocumentId,
    });
    logger.info({ document }, `Retrieved document from ragie`);
    return document.status === `ready`;
  }
}

const ragieProvider = new RagieProvider();

export default ragieProvider;
