import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/client/components/ui/button";
import { CardDescription } from "@/client/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/client/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/client/components/ui/form";
import { Input } from "@/client/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/client/components/ui/select";
import { Skeleton } from "@/client/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/client/components/ui/table";
import { Textarea } from "@/client/components/ui/textarea";
import { TypographyH3 } from "@/client/components/ui/typography/H3";
import { PresetQuestionRow } from "@/client/components/views/project/activity/presetQuestions/PresetQuestionRow";
import ProjectActivityContainer from "@/client/components/views/project/activity/ProjectActivityContainer";
import { useProjectContext } from "@/client/context/ProjectContext";
import { api } from "@/utils/api";

export default function Component() {
  const { project, setProject, company } = useProjectContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const addPresetQuestionMutation = api.project.addPresetQuestion.useMutation();
  const isLoading = addPresetQuestionMutation.isPending;

  const form = useForm<{
    question: string;
    documentId: string;
    referenceText: string;
  }>({
    resolver: zodResolver(
      z.object({
        question: z.string().nonempty(`Question is required`),
        documentId: z.string().nonempty(`Document is required`),
        referenceText: z.string().optional(),
      })
    ),
  });

  const handleAddExtraction = async (data: {
    question: string;
    documentId: string;
    referenceText: string;
  }) => {
    setIsModalOpen(false);

    const updatedProject = await addPresetQuestionMutation.mutateAsync({
      projectId: project.id,
      question: data.question.trim(),
      companyId: company.id,
      documentId: data.documentId,
      referenceText: data.referenceText,
    });

    setProject(updatedProject);
    form.reset();
  };

  const presetQuestions = useMemo(() => {
    return [...project.ProjectGenAISections].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [project.ProjectGenAISections]);

  return (
    <ProjectActivityContainer className="h-full overflow-hidden">
      <div className="flex h-full w-full flex-col gap-4 overflow-y-auto p-8">
        <div className="flex justify-between gap-4">
          <div className="flex flex-col gap-4">
            <TypographyH3>Generate report sections</TypographyH3>
            <CardDescription>
              Write reports with our context-aware assistant.
            </CardDescription>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            size="sm"
            className="gap-1 self-center "
          >
            Write new section
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
        <Table>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell>
                  <Skeleton className="h-16 w-full" />
                </TableCell>
              </TableRow>
            )}
            {presetQuestions.map((question) => (
              <PresetQuestionRow key={question.id} question={question} />
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate report section</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddExtraction)}>
              <div className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="documentId"
                  render={({ field }) => (
                    <FormItem className="w-full flex-none">
                      <FormLabel>
                        What document should we use to write this section?
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
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

                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>This section is about</FormLabel>
                      <FormControl>
                        <Input placeholder=" " {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="referenceText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Reference text to match writing style (Optional)
                      </FormLabel>
                      <FormControl>
                        <Textarea placeholder="" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    `Write section`
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </ProjectActivityContainer>
  );
}
