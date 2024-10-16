import { type Project, ProjectStatus } from "@prisma/client";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/client/components/ui/button";
import { DropdownMenuItem } from "@/client/components/ui/dropdown-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/client/components/ui/dropdown-menu";
import { api } from "@/utils/api";

type ProjectActionsDropdownProps = {
  project: Project;
  companyId: string;
  onSuccess: () => void;
};

export function ProjectActionsDropdown({
  project,
  companyId,
  onSuccess,
}: ProjectActionsDropdownProps) {
  const setProjectStatusMutation = api.project.setProjectStatus.useMutation({
    onSuccess,
  });

  const handleToggleProjectStatus = () => {
    setProjectStatusMutation.mutate({
      projectId: project.id,
      status:
        project.status === ProjectStatus.ACTIVE
          ? ProjectStatus.ARCHIVED
          : ProjectStatus.ACTIVE,
      companyId,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-haspopup="true"
          size="icon"
          variant="ghost"
          disabled={setProjectStatusMutation.isPending}
        >
          {setProjectStatusMutation.isPending ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <MoreHorizontal className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={handleToggleProjectStatus}
          disabled={setProjectStatusMutation.isPending}
        >
          {setProjectStatusMutation.isPending ? (
            <span className="loading loading-spinner loading-xs" />
          ) : project.status === ProjectStatus.ACTIVE ? (
            `Archive project`
          ) : (
            `Unarchive project`
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
