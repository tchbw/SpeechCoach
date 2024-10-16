import { RAGProvider as RAGProviderEnum } from "@prisma/client";

import type { ProjectDocumentWithDefaults } from "@/server/services/project/model";
import carbonProvider from "@/server/services/rag/providers/carbonProvider";
import ragieProvider from "@/server/services/rag/providers/ragieProvider";
import type { RetrievedRagChunk } from "@/server/services/rag/types";
import { assertUnreachable } from "@/server/util/types";

export abstract class RAGProvider {
  static getProvider(provider: RAGProviderEnum) {
    switch (provider) {
      case RAGProviderEnum.Ragie:
        return ragieProvider;
      case RAGProviderEnum.Carbon:
        return carbonProvider;
      default:
        assertUnreachable(provider, `Invalid RAG provider`);
    }
  }

  abstract ingestRagDocument({
    document,
    projectId,
  }: {
    document: {
      s3Key: string;
      name: string;
    };
    projectId: string;
  }): Promise<{ projectDocument: ProjectDocumentWithDefaults }>;

  abstract retrieveDocuments({
    projectId,
    query,
    providerDocumentId,
  }: {
    projectId: string;
    query: string;
    providerDocumentId?: string;
  }): Promise<RetrievedRagChunk[]>;

  abstract isDocumentReadyForQuery({
    providerDocumentId,
  }: {
    providerDocumentId: string;
  }): Promise<boolean>;
}
