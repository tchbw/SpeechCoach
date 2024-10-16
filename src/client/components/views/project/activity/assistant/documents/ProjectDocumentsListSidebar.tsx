import { File, PlusIcon } from "lucide-react";
import React from "react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/client/components/ui/dialog";
import RagDocumentUploader from "@/client/components/views/project/activity/assistant/documents/RagDocumentUploader";
import type { ProjectWithDefaults } from "@/server/services/project/model";

type ProjectDocumentsListSidebarProps = {
  project: ProjectWithDefaults;
};

function ProjectDocumentsListSidebar({
  project,
}: ProjectDocumentsListSidebarProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <>
      <nav className="grid items-start px-2 py-2 text-sm font-medium lg:px-4">
        <div className="flex justify-between text-muted-foreground/80">
          <span>Your documents</span>
          <PlusIcon
            className="h-4 w-4 flex-none cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          />
        </div>
        {project.documents.map((document) => (
          <div
            key={document.id}
            className="flex items-center gap-3 rounded-lg py-2 text-muted-foreground transition-all hover:text-primary"
          >
            <File className="h-4 w-4 flex-none" />
            {document.name}
          </div>
        ))}
      </nav>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogTitle>Upload Documents</DialogTitle>
          <RagDocumentUploader
            companyId={project.companyId}
            projectId={project.id}
            onDocumentSubmit={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ProjectDocumentsListSidebar;
