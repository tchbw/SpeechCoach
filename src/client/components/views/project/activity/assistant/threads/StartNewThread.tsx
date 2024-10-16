import { zodResolver } from "@hookform/resolvers/zod";
import type { ChatMessageThread } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button } from "@/client/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/client/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/client/components/ui/select";
import { useProjectContext } from "@/client/context/ProjectContext";
import { logger } from "@/init/logger";
import { api } from "@/utils/api";

export default function StartNewThread({
  onThreadCreated,
}: {
  onThreadCreated: (thread: ChatMessageThread) => void;
}) {
  const { project, company } = useProjectContext();

  const form = useForm<{
    documentId: string;
  }>({
    resolver: zodResolver(
      z.object({
        documentId: z.string().nonempty(`Document is required`),
      })
    ),
  });

  const createThreadMutation = api.project.createChatThread.useMutation();

  logger.info({ formErrors: form.formState.errors }, `errors`);
  const onSubmit = async (data: { documentId: string }) => {
    const document = project.documents.find(
      (document) => document.id === data.documentId
    );
    if (!document) {
      toast.error(`Document not found`);
      return;
    }

    const thread = await createThreadMutation.mutateAsync({
      documentId: data.documentId,
      name: `${document.name} chat`,
      companyId: company.id,
    });

    onThreadCreated(thread);
  };

  return (
    <Form {...form}>
      <Card className="mx-auto w-96 self-center">
        <CardHeader>
          <CardTitle>Start new chat</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex h-full w-full flex-col space-y-4 "
          >
            <FormField
              control={form.control}
              name="documentId"
              render={({ field }) => (
                <FormItem className="w-full flex-none">
                  <FormLabel>What document do you want to chat with?</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Documents</SelectLabel>
                        {project.documents.map((document) => (
                          <SelectItem key={document.id} value={document.id}>
                            {document.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <Button disabled={createThreadMutation.isPending}>
              {createThreadMutation.isPending ? (
                <span>
                  <Loader2 className="h-4 w-4 animate-spin" />
                </span>
              ) : (
                `Start new chat`
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Form>
  );
}
