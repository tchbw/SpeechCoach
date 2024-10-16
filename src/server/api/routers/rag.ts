import { z } from "zod";

import { companyRequiredProcedure, createTRPCRouter } from "@/server/api/trpc";
import { RagService } from "@/server/services/rag/service";

export const ragRouter = createTRPCRouter({
  ingestRagDocument: companyRequiredProcedure
    .input(
      z.object({
        documents: z.array(
          z.object({
            s3Key: z.string(),
            name: z.string(),
          })
        ),
        projectId: z.string(),
      })
    )
    .mutation(async ({ ctx, input: { documents, projectId } }) => {
      return await RagService.withContext(ctx.authContext).ingestRagDocuments({
        documents,
        projectId,
      });
    }),

  isThreadReadyForQuery: companyRequiredProcedure
    .input(
      z.object({
        projectId: z.string(),
        threadId: z.string(),
      })
    )
    .query(async ({ ctx, input: { projectId, threadId } }) => {
      const isReady = await RagService.withContext(
        ctx.authContext
      ).isThreadReadyForQuery({
        projectId,
        threadId,
      });
      return { isReady };
    }),
});
