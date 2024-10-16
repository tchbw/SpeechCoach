import type { Prisma } from "@prisma/client";

import { prisma } from "@/server/init/db";

export const projectDocumentModelDefaultInclude = {
  ChatThreads: true,
};

export type ProjectDocumentWithDefaults = Prisma.ProjectDocumentGetPayload<{
  include: typeof projectDocumentModelDefaultInclude;
}>;

export const projectModelDefaultInclude = {
  documents: {
    include: projectDocumentModelDefaultInclude,
  },
  ProjectGenAISections: true,
  GenAIReportSections: {
    include: {
      subSections: {
        include: {
          Paragraphs: true,
        },
      },
    },
  },
};

export type ProjectWithDefaults = Prisma.ProjectGetPayload<{
  include: typeof projectModelDefaultInclude;
}>;

class ProjectsModel {
  async byId(id: string) {
    return await prisma.project.findUnique({
      where: {
        id,
      },
      include: projectModelDefaultInclude,
    });
  }
}

const projectsModel = new ProjectsModel();
export { projectsModel };
