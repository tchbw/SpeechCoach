import type { ChatMessageThread, Company } from "@prisma/client";
import { createContext, useContext, useState } from "react";

import type { ProjectWithDefaults } from "@/server/services/project/model";

type ProjectContextType = {
  company: Company;
  project: ProjectWithDefaults;
  setProject: (project: ProjectWithDefaults) => void;
  chatThreads: ChatMessageThread[];
  setChatThreads: (chatThreads: ChatMessageThread[]) => void;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function useProjectContext() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error(`useProjectContext must be used within a ProjectProvider`);
  }
  return context;
}

export function ProjectContextProvider({
  company,
  project: initialProject,
  chatThreads: initialChatThreads,
  children,
}: Omit<ProjectContextType, `setProject` | `setChatThreads`> & {
  children: React.ReactNode;
}) {
  const [project, setProject] = useState(initialProject);
  const [chatThreads, setChatThreads] =
    useState<ChatMessageThread[]>(initialChatThreads);

  return (
    <ProjectContext.Provider
      value={{
        company,
        project,
        setProject,
        chatThreads,
        setChatThreads,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}
