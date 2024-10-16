"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { readStreamableValue } from "ai/rsc";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Textarea from "react-textarea-autosize";

import { generate } from "@/app/actions";
import QAResponseCard from "@/app/QAResponseCard";
import type { PartialReligionQA, ReligionQAForm } from "@/app/types";
import { Religion, religionQAFormSchema } from "@/app/types";
import { Button } from "@/client/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/client/components/ui/form";
import { useEnterSubmit } from "@/client/hooks/use-enter-submit";

function FormComponent() {
  const [religionQAResponse, setReligionQAResponse] =
    useState<PartialReligionQA>();

  const form = useForm<ReligionQAForm>({
    resolver: zodResolver(religionQAFormSchema),
  });

  const { formRef, onKeyDown } = useEnterSubmit({
    disabled: form.formState.isSubmitting,
  });

  async function onSubmit(data: ReligionQAForm) {
    const { object } = await generate(data);

    try {
      for await (const partialObject of readStreamableValue(object)) {
        if (partialObject) {
          setReligionQAResponse(partialObject);
        }
      }
      form.reset({
        question: ``,
      });
    } catch (error) {
      toast.error(`Error generating response`);
    }
  }

  return (
    <Form {...form}>
      <form
        ref={formRef}
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col items-center gap-4 px-16 py-20"
      >
        <div className="w-full max-w-lg">
          <FormField
            control={form.control}
            name="question"
            render={({ field }) => (
              <FormItem className="justify-apart relative flex max-h-60 w-full grow items-start overflow-hidden bg-background pl-8 sm:rounded-md sm:border sm:pl-12">
                <FormControl>
                  <Textarea
                    {...field}
                    tabIndex={0}
                    onKeyDown={onKeyDown}
                    placeholder="Ask about a religious topic"
                    className="min-h-[60px] w-full resize-none bg-transparent px-2 py-[1.3rem] focus-within:outline-none sm:text-sm"
                    autoFocus
                    spellCheck={false}
                    autoComplete="off"
                    autoCorrect="off"
                    name="message"
                    rows={1}
                  />
                </FormControl>
                <div className="pr-2 pt-[3px]">
                  <Button
                    type="submit"
                    size="icon"
                    disabled={field.value === `` || form.formState.isSubmitting}
                    className=""
                  >
                    {form.formState.isSubmitting ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <ArrowRight />
                    )}
                    <span className="sr-only">Send message</span>
                  </Button>
                </div>
              </FormItem>
            )}
          />
        </div>
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          <QAResponseCard
            qaResponses={religionQAResponse?.qaResponses ?? undefined}
            religion={Religion.CHRISTIANITY}
          />
          <QAResponseCard
            qaResponses={religionQAResponse?.qaResponses ?? undefined}
            religion={Religion.ISLAM}
          />
          <QAResponseCard
            qaResponses={religionQAResponse?.qaResponses ?? undefined}
            religion={Religion.BUDDHISM}
          />
        </div>

        {/* <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle>Hello</CardTitle>
              <CardDescription>Hello</CardDescription>
            </CardHeader>
            <CardContent>Hello</CardContent>
          </Card>
          <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle>Hello</CardTitle>
              <CardDescription>Hello</CardDescription>
            </CardHeader>
            <CardContent>Hello</CardContent>
          </Card>
          <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle>Hello</CardTitle>
              <CardDescription>Hello</CardDescription>
            </CardHeader>
            <CardContent>Hello</CardContent>
          </Card>
        </div> */}
      </form>
    </Form>
  );
}

export default FormComponent;
