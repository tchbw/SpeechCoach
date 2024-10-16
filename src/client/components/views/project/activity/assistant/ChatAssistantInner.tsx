import { zodResolver } from "@hookform/resolvers/zod";
import type { JSONValue } from "ai";
import { useChat } from "ai/react";
import assert from "assert";
import { MessageCircleWarning } from "lucide-react";
import { type BaseSyntheticEvent, useRef } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/client/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/client/components/ui/form";
import RadioInput from "@/client/components/ui/form/RadioInput";
import { Input } from "@/client/components/ui/input";
import { Skeleton } from "@/client/components/ui/skeleton";
import ChatInput from "@/client/components/views/project/activity/assistant/ChatInput";
import ChatMessages from "@/client/components/views/project/activity/assistant/ChatMessages";
import { env } from "@/env";
import { logger } from "@/init/logger";
import type { ProjectWithDefaults } from "@/server/services/project/model";
import type { ChatMessage } from "@/server/services/project/types";
import { api, disableRefetchingConfig } from "@/utils/api";
import type { ProjectChatForm } from "@/utils/project";
import { projectChatFormSchema } from "@/utils/project";

type Props = {
  project: ProjectWithDefaults;
  starterQuestions?: string[];
  threadId: string;
};

export default function ChatAssistantInner({
  project,
  starterQuestions,
  threadId,
}: Props) {
  const getThreadHistoryQuery = api.project.getThreadHistory.useQuery(
    { threadId, companyId: project.companyId },
    {
      ...disableRefetchingConfig,
      refetchOnMount: true,
    }
  );
  const isThreadReadyForQueryQuery = api.rag.isThreadReadyForQuery.useQuery({
    projectId: project.id,
    threadId,
    companyId: project.companyId,
  });

  const isLoading =
    getThreadHistoryQuery.isLoading || isThreadReadyForQueryQuery.isLoading;

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col gap-4 p-12">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-full w-full flex-1" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (!getThreadHistoryQuery.data) {
    return <div>No thread history</div>;
  }

  if (!isThreadReadyForQueryQuery.data) {
    return <div>Thread not ready for query</div>;
  }

  return (
    <LoadedChatAssistant
      project={project}
      starterQuestions={starterQuestions}
      threadId={threadId}
      threadHistory={getThreadHistoryQuery.data}
      fullDocumentRagReady={isThreadReadyForQueryQuery.data.isReady}
    />
  );
}

function LoadedChatAssistant({
  project,
  starterQuestions,
  threadId,
  threadHistory,
  fullDocumentRagReady,
}: Props & {
  threadHistory: ChatMessage[];
  fullDocumentRagReady: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const form = useForm<ProjectChatForm>({
    resolver: zodResolver(projectChatFormSchema),
    defaultValues: {
      questionType: `pageRange`,
    },
  });

  const {
    messages,
    input,
    isLoading,
    handleSubmit,
    handleInputChange,
    reload,
    stop,
    append,
    setInput,
  } = useChat({
    api: `${env.NEXT_PUBLIC_APP_URL}/api/chat`,
    headers: {
      "Content-Type": `application/json`, // using JSON because of vercel/ai 2.2.26
    },
    initialMessages: threadHistory,
    onError: (error: unknown) => {
      if (!(error instanceof Error)) throw error;
      const message = JSON.parse(error.message) as { detail: string };
      toast.error(message.detail);
    },
    experimental_prepareRequestBody: (options) => {
      if (threadId === null) {
        throw new Error(`Thread ID is required`);
      }

      return {
        messages: options.messages as unknown as JSONValue[],
        projectId: project.id,
        threadId,
        ...form.getValues(),
      };
    },
  });

  logger.info({ formErrors: form.formState.errors }, `form errors`);
  const onSubmit = (_data: ProjectChatForm, e?: BaseSyntheticEvent) => {
    // const annotations = getAnnotations();
    // if (annotations.length) {
    //   handleSubmitWithAnnotations(e, annotations);
    //   return reset();
    // }

    if (
      form.watch(`questionType`) === `fullDocument` &&
      !fullDocumentRagReady
    ) {
      toast.error(
        `Document still processing. Please try again in a few minutes.`
      );
      return;
    }

    assert(e, `Event is required`);
    handleSubmit(e);
  };

  const submitForm = () => {
    formRef.current?.requestSubmit();
  };

  return (
    <Form {...form}>
      <form
        ref={formRef}
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex h-full w-full flex-col  "
      >
        <div className="sticky top-0 z-10 space-y-4 border-b border-dashed border-muted-foreground/40 bg-white p-6 shadow-sm">
          <RadioInput
            name="questionType"
            control={form.control}
            register={form.register}
            options={[
              {
                value: `pageRange`,
                label: `Chat with a page range (recommended)`,
              },
              {
                value: `fullDocument`,
                label: `Chat with entire document`,
              },
            ]}
            className="flex space-x-4"
            formDescription="Page range is recommended for best performance."
          />
          {form.watch(`questionType`) === `pageRange` && (
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="range.pageRangeStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Page</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="w-[100px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="range.pageRangeEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Page</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="w-[100px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
          {form.watch(`questionType`) === `fullDocument` &&
            !fullDocumentRagReady && (
              <Alert variant="warning">
                <MessageCircleWarning className="h-4 w-4" />
                <AlertTitle>Document still processing</AlertTitle>
                <AlertDescription>
                  We need a few more minutes to process the document for
                  chatting with. You can still chat with a page range in the
                  meantime.
                </AlertDescription>
              </Alert>
            )}
        </div>

        <ChatMessages
          messages={messages}
          isLoading={isLoading}
          reload={reload}
          stop={stop}
          append={append}
          starterQuestions={starterQuestions}
          setInput={setInput}
          submitForm={submitForm}
        />
        <ChatInput
          input={input}
          handleInputChange={handleInputChange}
          isLoading={isLoading}
          messages={messages}
          // append={append}
          setInput={setInput}
        />
      </form>
    </Form>
  );
}
