import type { ReactNode } from "react";
import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import ChatAssistantInner from "@/client/components/views/project/activity/assistant/ChatAssistantInner";
import RagDocumentUploader from "@/client/components/views/project/activity/assistant/documents/RagDocumentUploader";
import StartNewThread from "@/client/components/views/project/activity/assistant/threads/StartNewThread";
import ThreadsSidebar from "@/client/components/views/project/activity/assistant/threads/ThreadsSidebar";
import ProjectActivityContainer from "@/client/components/views/project/activity/ProjectActivityContainer";
import { useProjectContext } from "@/client/context/ProjectContext";

type Props = {
  starterQuestions?: string[];
};

export default function ChatSection({ starterQuestions }: Props) {
  const [threadId, setThreadId] = useState<string | null>(null);

  const { project, chatThreads, setChatThreads } = useProjectContext();

  let content: ReactNode;
  if (project.documents.length === 0) {
    content = (
      <Card className="mx-auto w-96 self-center">
        <CardHeader>
          <CardTitle>Upload a document</CardTitle>
          <CardDescription>
            Upload a document to start a chat with the assistant.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RagDocumentUploader
            companyId={project.companyId}
            projectId={project.id}
          />
        </CardContent>
      </Card>
    );
  } else if (threadId === null) {
    content = (
      <StartNewThread
        onThreadCreated={(thread) => {
          setThreadId(thread.id);
          setChatThreads([thread, ...chatThreads]);
        }}
      />
    );
  } else {
    content = (
      <ChatAssistantInner
        key={threadId}
        project={project}
        threadId={threadId}
        starterQuestions={starterQuestions}
      />
    );
  }

  return (
    <ProjectActivityContainer className="h-full overflow-hidden">
      <div className="flex h-full w-full items-center overflow-hidden">
        <ThreadsSidebar
          chatThreads={chatThreads}
          setThreadId={setThreadId}
          threadId={threadId}
        />
        {content}
      </div>
    </ProjectActivityContainer>
  );
}
