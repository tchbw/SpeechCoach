import { EggFriedIcon } from "lucide-react";
import Link from "next/link";

import ProjectDocumentsListSidebar from "@/client/components/views/project/activity/assistant/documents/ProjectDocumentsListSidebar";
import { ProjectActivitySelector } from "@/client/components/views/project/ProjectActivitySelector";
import { useProjectContext } from "@/client/context/ProjectContext";
import { Routes } from "@/utils/router/routes";

export function ProjectSidebar() {
  const { project, company } = useProjectContext();
  return (
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link
          href={Routes.company.dashboard({ orgSlug: company.slug })}
          className="flex items-center gap-2 font-semibold"
        >
          <EggFriedIcon className="h-6 w-6" />
          <span className="">Degrom</span>
        </Link>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <ProjectActivitySelector />
        <ProjectDocumentsListSidebar project={project} />
      </div>
    </div>
  );
}
