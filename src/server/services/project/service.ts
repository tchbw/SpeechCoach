import type { ChatMessageThread, ProjectStatus } from "@prisma/client";
import { Prisma, RAGProvider } from "@prisma/client";
import assert from "assert";

import { env } from "@/env";
import { prisma } from "@/server/init/db";
import { openai } from "@/server/init/openai";
import { hasCompanyPerm } from "@/server/services/authorization/service";
import { CompanyAction } from "@/server/services/authorization/types";
import { BaseService } from "@/server/services/BaseService";
import { fileService } from "@/server/services/file/service";
import type { ProjectWithDefaults } from "@/server/services/project/model";
import {
  projectModelDefaultInclude,
  projectsModel,
} from "@/server/services/project/model";
import type {
  ChatMessage,
  GenAIReportSectionCreate,
} from "@/server/services/project/types";
import { ChatMessageDBMapper } from "@/server/services/project/util";
import { RagService } from "@/server/services/rag/service";
import { GptUtil } from "@/utils/gpt";

export class ProjectService extends BaseService {
  async createNewProject({
    name,
    companyId,
    userId,
  }: {
    name: string;
    companyId: string;
    userId: string;
  }) {
    await hasCompanyPerm(this.ctx, [CompanyAction.CREATE_PROJECT], companyId);
    return await prisma.project.create({
      data: {
        name,
        companyId,
        ragProvider: RAGProvider.Ragie,
        createdByUserId: userId,
      },
    });
  }

  async getProject(projectId: string): Promise<ProjectWithDefaults | null> {
    const project = await projectsModel.byId(projectId);

    if (project) {
      await hasCompanyPerm(
        this.ctx,
        [CompanyAction.VIEW_PROJECT],
        project.companyId
      );
    }

    return project;
  }

  async addPresetQuestion({
    projectId,
    documentId,
    question,
    referenceText,
  }: {
    projectId: string;
    documentId: string;
    question: string;
    referenceText?: string;
  }): Promise<ProjectWithDefaults> {
    const document = await prisma.projectDocument.findUniqueOrThrow({
      where: { id: documentId },
    });

    const documents = await RagService.withContext(this.ctx).retrieveDocuments({
      projectId,
      query: question,
      providerDocumentId: document.ragProviderDocumentId,
    });

    const chunkText = documents.map((chunk) => chunk.text).join(`\n\n`);
    const systemPrompt = `You are an AI assistant that helps engineers write technical reports. ${referenceText ? `The user wants to copy the writing style of this text, but the content is not necessarily related to the user's prompt: ${referenceText}\n\n` : ``}The user wants to write a section of the report based on document records. Relevant snippets of the document are provided below. Please write a section of the report based on the user's prompt:\n\n${question}\n\n Here are the potentially relevant document records:\n\n${chunkText}`;

    const response = await openai.chat.completions.create({
      model: `gpt-4o-mini`,
      messages: [
        { role: `system`, content: systemPrompt },
        { role: `user`, content: question },
      ],
    });

    const [choice] = response.choices;
    assert(choice, `No choice in response`);
    const answer = choice.message.content;
    assert(answer, `No answer in response`);

    // Save the result in the ProjectPresetQuestion table
    await prisma.projectGenAISection.create({
      data: {
        projectId,
        prompt: question,
        response: answer,
        referenceText,
      },
    });

    const updatedProject = await projectsModel.byId(projectId);
    assert(updatedProject, `Project not found`);
    return updatedProject;
  }

  async createGenAIReportSections({
    projectId,
    sections,
    companyId,
  }: {
    projectId: string;
    sections: GenAIReportSectionCreate[];
    companyId: string;
  }) {
    await hasCompanyPerm(this.ctx, [CompanyAction.UPDATE_PROJECT], companyId);

    return await prisma.$transaction(async (tx) => {
      const createdSections = await Promise.all(
        sections.map(async (section, i) => {
          const createdSection = await tx.genAIReportSection.create({
            data: {
              projectId,
              sectionHeading: section.sectionHeading,
              order: new Prisma.Decimal(i),
            },
          });

          const createdSubSections = await Promise.all(
            section.subSections.map(async (subSection, j) => {
              const createdSubSection = await tx.genAIReportSubsection.create({
                data: {
                  sectionId: createdSection.id,
                  subSectionHeading: subSection.subSectionHeading,
                  order: new Prisma.Decimal(j),
                },
              });

              await tx.genAIReportParagraph.createMany({
                data: subSection.paragraphs.map((paragraph, k) => ({
                  subSectionId: createdSubSection.id,
                  paragraph,
                  order: new Prisma.Decimal(k),
                })),
              });

              return createdSubSection;
            })
          );

          return { ...createdSection, subSections: createdSubSections };
        })
      );

      return createdSections;
    });
  }

  /**
   * Updates a paragraph with new content based on the provided edit instructions.
   * TODO: We'll want to be smart in the future and figure out whether to include project or report context
   * @param paragraphId - The ID of the paragraph to update.
   * @param editInstructions - The instructions for editing the paragraph.
   * @param companyId - The ID of the company associated with the project.
   * @returns The updated paragraph.
   */
  async editGeneratedParagraph({
    paragraphId,
    editSuggestion,
    templateSuggestion,
    companyId,
  }: {
    paragraphId: string;
    editSuggestion?: string;
    templateSuggestion?: string;
    companyId: string;
  }) {
    // TODO: Will want to just get the companyId from the paragraphId for better security
    await hasCompanyPerm(this.ctx, [CompanyAction.UPDATE_PROJECT], companyId);

    const paragraph = await prisma.genAIReportParagraph.findUniqueOrThrow({
      where: { id: paragraphId },
    });

    const editSuggestionCombinedPrompt: string[] = [];
    if (editSuggestion) {
      editSuggestionCombinedPrompt.push(editSuggestion);
    }
    if (templateSuggestion) {
      editSuggestionCombinedPrompt.push(
        `Write the paragraph in the following style, but do not take any content of substance from this paragraph itself: \n\n${templateSuggestion}`
      );
    }
    if (editSuggestionCombinedPrompt.length === 0) {
      editSuggestionCombinedPrompt.push(`Please rewrite the paragraph.`);
    }

    const response = await GptUtil.getCompletion({
      messages: [
        {
          role: `system`,
          content: `You are an assistant helping the user write a technical report. They want to edit a paragraph in the report. Please respond back with a new paragraph after applying their suggested edits. Do not reply with anything other than the edited paragraph and only the edited paragraph. There paragraph they are editing is: 
          \`\`\`
          ${paragraph.paragraph}
          \`\`\``,
        },
        { role: `user`, content: editSuggestionCombinedPrompt.join(`\n\n`) },
      ],
    });

    assert(response.content, `Expected new suggested paragraph`);

    return await prisma.genAIReportParagraph.update({
      where: { id: paragraphId },
      data: { paragraph: response.content },
    });
  }

  async getProjectDocumentS3Url({
    documentId,
    companyId,
  }: {
    documentId: string;
    companyId: string;
  }): Promise<string> {
    await hasCompanyPerm(this.ctx, [CompanyAction.VIEW_PROJECT], companyId);
    const document = await prisma.projectDocument.findUniqueOrThrow({
      where: { id: documentId },
    });
    const presignedGetUrl = await fileService.getPresignedUrlForFile({
      path: document.s3Key,
      action: `read`,
      bucket: env.AWS_S3_BUCKET,
      expires: 1,
      expiresUnit: `days`,
    });

    return presignedGetUrl;
  }

  async getCompanyProjects(companyId: string): Promise<ProjectWithDefaults[]> {
    await hasCompanyPerm(this.ctx, [CompanyAction.VIEW_PROJECT], companyId);
    return await prisma.project.findMany({
      where: { companyId },
      include: projectModelDefaultInclude,
    });
  }

  async getPastQuickExtractions({
    projectId,
    companyId,
  }: {
    projectId: string;
    companyId: string;
  }) {
    await hasCompanyPerm(this.ctx, [CompanyAction.VIEW_PROJECT], companyId);

    return await prisma.parsedDocument.findMany({
      where: { projectId },
      orderBy: { createdAt: `desc` },
    });
  }

  async createThread({
    documentId,
    name,
  }: {
    documentId: string;
    name: string;
  }): Promise<ChatMessageThread> {
    const document = await prisma.projectDocument.findUniqueOrThrow({
      where: { id: documentId },
      include: { project: true },
    });

    await hasCompanyPerm(
      this.ctx,
      [CompanyAction.UPDATE_PROJECT],
      document.project.companyId
    );

    return await prisma.chatMessageThread.create({
      data: {
        documentId: document.id,
        name,
      },
    });
  }

  async getThreadHistory(threadId: string): Promise<ChatMessage[]> {
    const thread = await prisma.chatMessageThread.findUniqueOrThrow({
      where: { id: threadId },
      include: { Document: { include: { project: true } } },
    });

    await hasCompanyPerm(
      this.ctx,
      [CompanyAction.VIEW_PROJECT],
      thread.Document.project.companyId
    );

    const dbRows = await prisma.chatMessageRow.findMany({
      where: { threadId },
      orderBy: { createdAt: `asc` },
    });

    return dbRows.map(ChatMessageDBMapper.fromDb);
  }

  async setProjectStatus({
    projectId,
    status,
    companyId,
  }: {
    projectId: string;
    status: ProjectStatus;
    companyId: string;
  }): Promise<ProjectWithDefaults> {
    await hasCompanyPerm(this.ctx, [CompanyAction.UPDATE_PROJECT], companyId);

    return await prisma.project.update({
      where: { id: projectId },
      data: { status },
      include: projectModelDefaultInclude,
    });
  }
}
