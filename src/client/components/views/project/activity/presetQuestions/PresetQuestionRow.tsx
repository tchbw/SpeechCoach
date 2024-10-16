import { Check, Copy } from "lucide-react";

import { Button } from "@/client/components/ui/button";
import { TableCell, TableRow } from "@/client/components/ui/table";
import Markdown from "@/client/components/views/project/activity/assistant/message/markdown";
import { useCopyToClipboard } from "@/client/hooks/use-copy-to-clipboard";

type PresetQuestionRowProps = {
  question: {
    id: string;
    prompt: string;
    response: string;
  };
};

export function PresetQuestionRow({ question }: PresetQuestionRowProps) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });

  return (
    <TableRow className="w-full" key={question.id}>
      <TableCell>
        <div className="flex justify-between gap-4">
          <div>
            <div className="mb-2 font-medium">{question.prompt}</div>
            <div className="hidden text-sm text-muted-foreground md:inline">
              <Markdown content={question.response} />
            </div>
          </div>
          <Button
            onClick={() => copyToClipboard(question.response)}
            size="icon"
            variant="ghost"
            className="h-8 w-8 flex-none self-center p-1 group-hover:opacity-100"
          >
            {isCopied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
