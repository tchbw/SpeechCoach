import type { ChatMessageThread, Company, User } from "@prisma/client";

import { ProjectActivityRenderer } from "@/client/components/views/project/activity/ProjectActivityRenderer";
import { ProfileDropdown } from "@/client/components/views/project/ProfileDropdown";
import { ProjectBreadcrumb } from "@/client/components/views/project/ProjectBreadcrumb";
import { ProjectSidebar } from "@/client/components/views/project/ProjectSidebar";
import { ProjectContextProvider } from "@/client/context/ProjectContext";
import { RAG_DOCUMENT_STARTER_QUESTIONS } from "@/pages/o/[orgSlug]/project/[projectId]/const";
import { RequireCompany } from "@/pages/util";
import type { ProjectWithDefaults } from "@/server/services/project/model";
import { ProjectService } from "@/server/services/project/service";
import { flattenAndSortChatThreads } from "@/utils/project";
import { Routes } from "@/utils/router/routes";

export type Props = {
  user: User;
  company: Company;
  project: ProjectWithDefaults;
  chatThreads: ChatMessageThread[];
};

export default function Project({ company, project, chatThreads }: Props) {
  return (
    <ProjectContextProvider
      company={company}
      project={project}
      chatThreads={chatThreads}
    >
      <div className="grid h-screen w-full overflow-y-hidden md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden h-full border-r border-muted-foreground/20 bg-muted/40 md:block">
          <ProjectSidebar />
        </div>
        <div className="flex h-full flex-1 flex-col overflow-y-hidden">
          <header className="flex h-14 flex-none items-center justify-between gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <ProjectBreadcrumb company={company} project={project} />
            <ProfileDropdown />
          </header>
          <main className="flex flex-1 flex-col gap-4 overflow-y-hidden bg-muted p-4 lg:gap-6 lg:p-6">
            <ProjectActivityRenderer
              starterQuestions={RAG_DOCUMENT_STARTER_QUESTIONS}
            />
          </main>
        </div>
      </div>
    </ProjectContextProvider>
  );
}

export const getServerSideProps = RequireCompany(
  async ({ user, company, authContext, ctx }) => {
    const { projectId } = Routes.company.project.home.parse(
      ctx.params as typeof Routes.company.project.home.params
    );
    if (!projectId) {
      return {
        notFound: true,
      };
    }

    const project =
      await ProjectService.withContext(authContext).getProject(projectId);

    if (!project) {
      return {
        redirect: {
          destination: Routes.company.project.new({ orgSlug: company.slug }),
          permanent: false,
        },
      };
    }

    const chatThreads = flattenAndSortChatThreads(project.documents);

    return {
      props: {
        user,
        company,
        project,
        chatThreads,
      },
    };
  }
);
