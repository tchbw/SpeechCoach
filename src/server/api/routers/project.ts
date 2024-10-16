import { ProjectStatus } from "@prisma/client";
import { z } from "zod";

import { companyRequiredProcedure, createTRPCRouter } from "@/server/api/trpc";
import { DocumentParserService } from "@/server/services/document-parser/service";
import { DocumentParserProviderEnum } from "@/server/services/document-parser/types";
import { ProjectService } from "@/server/services/project/service";

export const projectRouter = createTRPCRouter({
  getProject: companyRequiredProcedure
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .mutation(async ({ ctx: { authContext }, input: { projectId } }) => {
      return await ProjectService.withContext(authContext).getProject(
        projectId
      );
    }),

  getCompanyProjects: companyRequiredProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ ctx: { authContext }, input }) => {
      return await ProjectService.withContext(authContext).getCompanyProjects(
        input.companyId
      );
    }),

  createProject: companyRequiredProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(
      async ({
        ctx: { companyMember, user, authContext },
        input: { name },
      }) => {
        return await ProjectService.withContext(authContext).createNewProject({
          name,
          companyId: companyMember.companyId,
          userId: user.id,
        });
      }
    ),

  addPresetQuestion: companyRequiredProcedure
    .input(
      z.object({
        projectId: z.string(),
        documentId: z.string(),
        question: z.string(),
        referenceText: z.string().optional(),
      })
    )
    .mutation(
      async ({
        ctx: { authContext },
        input: { projectId, documentId, question, referenceText },
      }) => {
        return await ProjectService.withContext(authContext).addPresetQuestion({
          projectId,
          documentId,
          question,
          referenceText,
        });
      }
    ),

  editGeneratedParagraph: companyRequiredProcedure
    .input(
      z.object({
        paragraphId: z.string(),
        editSuggestion: z.string().optional(),
        templateSuggestion: z.string().optional(),
      })
    )
    .mutation(
      async ({
        ctx: { authContext, company },
        input: { paragraphId, editSuggestion, templateSuggestion },
      }) => {
        return await ProjectService.withContext(
          authContext
        ).editGeneratedParagraph({
          paragraphId,
          editSuggestion,
          templateSuggestion,
          companyId: company.id,
        });
      }
    ),
  quickExtractDocument: companyRequiredProcedure
    .input(
      z.object({
        projectId: z.string(),
        documentKey: z.string(),
        documentName: z.string(),
      })
    )
    .mutation(
      async ({
        ctx: { authContext },
        input: { projectId, documentKey, documentName },
      }) => {
        return await DocumentParserService.withContext(
          authContext
        ).parseProjectDocument({
          projectId,
          documentKey,
          documentName,
          provider: DocumentParserProviderEnum.Reducto,
        });
      }
    ),
  getPastQuickExtractions: companyRequiredProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx: { authContext, company }, input: { projectId } }) => {
      return await ProjectService.withContext(
        authContext
      ).getPastQuickExtractions({ projectId, companyId: company.id });
    }),

  createChatThread: companyRequiredProcedure
    .input(z.object({ name: z.string(), documentId: z.string() }))
    .mutation(async ({ ctx: { authContext }, input: { name, documentId } }) => {
      return await ProjectService.withContext(authContext).createThread({
        name,
        documentId,
      });
    }),

  getThreadHistory: companyRequiredProcedure
    .input(z.object({ threadId: z.string() }))
    .query(async ({ ctx: { authContext }, input: { threadId } }) => {
      return await ProjectService.withContext(authContext).getThreadHistory(
        threadId
      );
    }),

  setProjectStatus: companyRequiredProcedure
    .input(
      z.object({
        projectId: z.string(),
        status: z.nativeEnum(ProjectStatus),
      })
    )
    .mutation(async ({ ctx: { authContext, company }, input }) => {
      return await ProjectService.withContext(authContext).setProjectStatus({
        projectId: input.projectId,
        status: input.status,
        companyId: company.id,
      });
    }),
});
