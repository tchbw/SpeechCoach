import { env } from "@/env";
import CarbonClient from "@/init/carbon";
import { logger } from "@/init/logger";
import { prisma } from "@/server/init/db";
import { fileService } from "@/server/services/file/service";
import { projectDocumentModelDefaultInclude } from "@/server/services/project/model";
import type { RAGProvider } from "@/server/services/rag/providers";
import type { RetrievedRagChunk } from "@/server/services/rag/types";

class CarbonProvider implements RAGProvider {
  async retrieveDocuments({
    projectId,
    query,
  }: {
    projectId: string;
    query: string;
    providerDocumentId?: string;
  }): Promise<RetrievedRagChunk[]> {
    // TODO: Implement documentId filtering
    const project = await prisma.project.findUniqueOrThrow({
      where: {
        id: projectId,
      },
    });
    const result = await CarbonClient.withCompanyId(
      project.companyId
    ).embeddings.getDocuments({
      query,
      k: 10,
      tags_v2: {
        key: `projectId`,
        value: projectId,
        negate: false,
      },
      // hybrid_search: true,
      high_accuracy: true,
    });

    return result.data.documents.map((document) => ({
      text: document.content,
      providerDocumentId: document.file_id.toString(),
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
    const project = await prisma.project.findUniqueOrThrow({
      where: {
        id: projectId,
      },
    });

    const presignedGetUrl = await fileService.getPresignedUrlForFile({
      path: document.s3Key,
      action: `read`,
      bucket: env.AWS_S3_BUCKET,
      expires: 1,
      expiresUnit: `days`,
    });

    const carbon = CarbonClient.withCompanyId(project.companyId);

    const projectDocument = await prisma.$transaction(async (tx) => {
      logger.info(`uploading to carbon`);
      const response = await carbon.files.uploadFromUrl({
        file_name: document.name,
        url: presignedGetUrl,
        parse_pdf_tables_with_ocr: true,
      });
      logger.info({ response }, `carbon response`);

      await carbon.files.createUserFileTags({
        organization_user_file_id: response.data.id,
        tags: {
          projectId: projectId,
        },
      });

      return await tx.projectDocument.create({
        data: {
          name: document.name,
          projectId,
          // status: RAGDocumentStatus.PROCESSING,
          s3Key: document.s3Key,
          ragProviderDocumentId: response.data.id.toString(),
        },
        include: projectDocumentModelDefaultInclude,
      });
    });

    return { projectDocument };
  }

  isDocumentReadyForQuery({}: {
    providerDocumentId: string;
  }): Promise<boolean> {
    throw new Error(`Not implemented`);
  }
}

const carbonProvider = new CarbonProvider();

export default carbonProvider;
