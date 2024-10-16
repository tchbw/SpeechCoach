import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "@/client/components/ui/button";
import ChatActions from "@/client/components/views/project/activity/assistant/ChatActions";
import type { ChatHandler } from "@/client/components/views/project/activity/assistant/ChatHandler.interface";
import ChatMessage from "@/client/components/views/project/activity/assistant/ChatMessage";

export default function ChatMessages(
  props: Pick<
    ChatHandler,
    | `messages`
    | `isLoading`
    | `reload`
    | `stop`
    | `append`
    | `starterQuestions`
    | `setInput`
  > & {
    submitForm: () => void;
  }
) {
  // const { starterQuestions } = useClientConfig();
  const scrollableChatContainerRef = useRef<HTMLDivElement>(null);
  const messageLength = props.messages.length;
  const lastMessage = props.messages[messageLength - 1];

  const scrollToBottom = () => {
    if (scrollableChatContainerRef.current) {
      scrollableChatContainerRef.current.scrollTop =
        scrollableChatContainerRef.current.scrollHeight;
    }
  };

  const isLastMessageFromAssistant =
    messageLength > 0 && lastMessage?.role !== `user`;
  const showReload =
    props.reload && !props.isLoading && isLastMessageFromAssistant;
  const showStop = props.stop && props.isLoading;

  // `isPending` indicate
  // that stream response is not yet received from the server,
  // so we show a loading indicator to give a better UX.
  const isPending = props.isLoading && !isLastMessageFromAssistant;

  useEffect(() => {
    scrollToBottom();
  }, [messageLength, lastMessage]);

  return (
    <div
      className="relative w-full flex-1 overflow-y-auto rounded-xl p-4"
      ref={scrollableChatContainerRef}
    >
      <div className="flex flex-col gap-5 divide-y">
        {props.messages.map((m) => {
          // const isLoadingMessage = i === messageLength - 1 && props.isLoading;
          return (
            <ChatMessage
              key={m.id}
              chatMessage={m}
              // isLoading={isLoadingMessage}
              // append={props.append}
            />
          );
        })}
        {isPending && (
          <div className="flex items-center justify-center pt-10">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
      </div>
      {(showReload || showStop) && (
        <div className="flex justify-end py-4">
          <ChatActions
            reload={props.reload}
            stop={props.stop}
            showReload={showReload}
            showStop={showStop}
          />
        </div>
      )}
      {!messageLength && props.starterQuestions?.length && props.append && (
        <div className="absolute bottom-6 left-0 w-full">
          <div className="mx-20 grid grid-cols-2 gap-2">
            {props.starterQuestions.map((question, i) => (
              <Button
                type="button"
                variant="outline"
                key={i}
                onClick={() => {
                  props.setInput(question);
                  props.submitForm();
                }}
                className="h-auto min-h-[2.5rem] whitespace-normal"
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
