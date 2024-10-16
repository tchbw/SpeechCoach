import dynamic from "next/dynamic";
import { useState } from "react";

import { Label } from "@/client/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/client/components/ui/select";
import ChatSection from "@/client/components/views/project/activity/assistant/ChatAssistantActivity";
import { useProjectContext } from "@/client/context/ProjectContext";

const DocumentSectionChat = dynamic(
  () =>
    import(
      `@/client/components/views/project/activity/sectionChat/DocumentSectionChat`
    ),
  {
    ssr: false,
  }
);

export default function SectionChatActivity() {
  const { project } = useProjectContext();
  const documents = project.documents;

  const [selectedDocument, setSelectedDocument] = useState<
    string | undefined
  >();

  return (
    <div className="flex w-full flex-col gap-4 p-8">
      <Select value={selectedDocument} onValueChange={setSelectedDocument}>
        <Label>Ask questions about your documents</Label>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a document" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Documents</SelectLabel>
            {documents.map((document) => (
              <SelectItem key={document.id} value={document.id}>
                {document.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {selectedDocument != null && (
        <DocumentSectionChat documentId={selectedDocument} />
      )}
      <ChatSection />
    </div>
  );
}
