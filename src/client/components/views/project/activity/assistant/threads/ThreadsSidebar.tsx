import type { ChatMessageThread } from "@prisma/client";
import clsx from "clsx";
import React from "react";

import { Button } from "@/client/components/ui/button";

type ThreadsSidebarProps = {
  chatThreads: ChatMessageThread[];
  threadId: string | null;
  setThreadId: React.Dispatch<React.SetStateAction<string | null>>;
};

function ThreadsSidebar({
  chatThreads,
  threadId,
  setThreadId,
}: ThreadsSidebarProps) {
  return (
    <div className="flex h-full w-56 flex-none flex-col self-stretch overflow-y-auto border-r-2 border-r-slate-200 bg-muted px-4 py-6">
      <Button
        disabled={threadId === null}
        onClick={() => {
          setThreadId(null);
        }}
      >
        New chat
      </Button>

      <div className="mb-1 mt-5 text-xs font-bold text-muted-foreground/80">
        THREADS
      </div>
      {chatThreads.map((thread) => (
        <div key={thread.id}>
          <button
            className={clsx(
              `block w-full cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap rounded-md p-1 text-left text-muted-foreground`,
              threadId === thread.id && `bg-gray-200`
            )}
            onClick={() => setThreadId(thread.id)}
          >
            {thread.name}
          </button>
        </div>
      ))}
    </div>
  );
}

export default ThreadsSidebar;
