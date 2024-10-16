import { zodResolver } from "@hookform/resolvers/zod";
import type { GenAIReportParagraph } from "@prisma/client";
import clsx from "clsx";
import { Check, Copy, Edit, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/client/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/client/components/ui/form";
import { Input } from "@/client/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/client/components/ui/popover";
import { Skeleton } from "@/client/components/ui/skeleton";
import { Textarea } from "@/client/components/ui/textarea";
import { useProjectContext } from "@/client/context/ProjectContext";
import { useCopyToClipboard } from "@/client/hooks/use-copy-to-clipboard";
import type { EditGeneratedParagraph } from "@/server/services/project/schema";
import { editGeneratedParagraphSchema } from "@/server/services/project/schema";
import { api } from "@/utils/api";

export function GeneratedParagraph({
  paragraph,
}: {
  paragraph: GenAIReportParagraph;
}) {
  const { project, setProject, company } = useProjectContext();
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });

  const form = useForm<EditGeneratedParagraph>({
    resolver: zodResolver(editGeneratedParagraphSchema),
  });

  const editGeneratedParagraphMutation =
    api.project.editGeneratedParagraph.useMutation();
  const fetchProjectMutation = api.project.getProject.useMutation();

  const isEditMutationLoading =
    editGeneratedParagraphMutation.isPending || fetchProjectMutation.isPending;

  // 2. Define a submit handler.
  async function onSubmit(values: EditGeneratedParagraph) {
    await editGeneratedParagraphMutation.mutateAsync({
      companyId: company.id,
      paragraphId: paragraph.id,
      editSuggestion: values.editSuggestion,
      templateSuggestion: values.templateSuggestion,
    });

    const updatedProject = await fetchProjectMutation.mutateAsync({
      companyId: company.id,
      projectId: project.id,
    });
    if (updatedProject) {
      setProject(updatedProject);
    }
  }

  return (
    <div className="group relative hover:bg-muted">
      <Popover>
        <PopoverContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="editSuggestion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Suggestion for edit</FormLabel>
                    <FormControl>
                      <Input autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="templateSuggestion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference paragraph</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormDescription>
                      Paste a reference paragraph to copy its style.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Edit paragraph</Button>
            </form>
          </Form>
        </PopoverContent>
        <p
          className={clsx(`mt-2 text-sm text-muted-foreground`, {
            "opacity-0": isEditMutationLoading,
          })}
        >
          {paragraph.paragraph}
        </p>
        {isEditMutationLoading && <Skeleton className="absolute inset-0" />}
        <div className="absolute inset-1/2 flex h-8 w-fit -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md border border-muted-foreground bg-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
          <button
            onClick={() => copyToClipboard(paragraph.paragraph)}
            className="flex items-center justify-center rounded-full p-4"
          >
            {isCopied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
          <PopoverTrigger asChild>
            <button
              className="flex items-center justify-center rounded-full p-4"
              disabled={isEditMutationLoading}
            >
              {isEditMutationLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Edit className="h-4 w-4" />
              )}
            </button>
          </PopoverTrigger>
        </div>
      </Popover>
    </div>
  );
}
