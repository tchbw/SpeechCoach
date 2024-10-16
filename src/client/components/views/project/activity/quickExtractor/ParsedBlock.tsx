import { Check, Copy } from "lucide-react";
import React from "react";

import { Button } from "@/client/components/ui/button";
import Markdown from "@/client/components/views/project/activity/assistant/message/markdown";
import { useCopyToClipboard } from "@/client/hooks/use-copy-to-clipboard";

function ParsedBlock({ parsedMd }: { parsedMd: string }) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });
  const contentRef = React.useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    if (contentRef.current) {
      void copyToClipboard(contentRef.current.innerText);
    }
  };

  return (
    <pre className="mt-2 flex w-fit gap-2">
      <div ref={contentRef} className="rounded-md bg-gray-100 p-4">
        <Markdown content={parsedMd} />
      </div>
      <Button
        onClick={handleCopy}
        size="icon"
        variant="ghost"
        className="h-8 w-8"
      >
        {isCopied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </pre>
  );
}

export default ParsedBlock;
