"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Textarea from "react-textarea-autosize";
import { z } from "zod";

import Analysis from "@/app/Analysis";
import type { SpeechAnalysis } from "@/app/types";
import { Button } from "@/client/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/client/components/ui/form";
import { useEnterSubmit } from "@/client/hooks/use-enter-submit";
import dayjs from "@/init/dayjs";
import { logger } from "@/init/logger";

import { generateWithAudio } from "./actions";

const audioFormSchema = z.object({
  question: z.string(),
});

type AudioForm = z.infer<typeof audioFormSchema>;

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioStartTime, setAudioStartTime] = useState<dayjs.Dayjs | null>(
    null
  );
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [analysisResults, setAnalysisResults] = useState<SpeechAnalysis | null>(
    null
  );

  const form = useForm<AudioForm>({
    resolver: zodResolver(audioFormSchema),
  });

  const { formRef, onKeyDown } = useEnterSubmit({
    disabled: form.formState.isSubmitting,
  });

  const startRecording = async () => {
    try {
      // Clear any existing recorded audio chunks
      setAudioChunks([]);

      logger.info(`Starting recording...`);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);

      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);

      recorder.ondataavailable = (event) => {
        logger.info(`chunks...`);

        if (event.data.size > 0) {
          setAudioChunks((chunks) => [...chunks, event.data]);
        }
      };

      recorder.start();
      setAudioStartTime(dayjs());
      setIsRecording(true);
    } catch (error) {
      logger.error(`Error accessing microphone:`, error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setAudioDuration(dayjs().diff(audioStartTime, `second`));
      setIsRecording(false);

      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
      }
    }

    logger.info(`audioChunks:`, audioChunks);
  };

  const onSubmit = async (data: AudioForm) => {
    if (audioChunks.length === 0) {
      toast.error(`Please record your answer first`);
      return;
    }

    const audioBlob = new Blob(audioChunks, { type: `audio/webm` });
    const audioFile = new File([audioBlob], `answer.webm`, {
      type: `audio/webm`,
    });

    logger.info({ audioFile }, `Audio file:`);

    const formData = new FormData();
    formData.append(`question`, data.question);
    formData.append(`audio`, audioFile);
    formData.append(`audioDuration`, audioDuration.toString());

    try {
      logger.info({ formData: formData.entries() }, `Form data:`);
      const result = await generateWithAudio(formData);
      setAnalysisResults(result);
      // Handle the result as needed
      logger.info(result, `Form submitted successfully:`);
      toast.success(`Form submitted successfully`);
    } catch (error) {
      logger.error(`Error submitting form:`, error);
      toast.error(`Error submitting form`);
    }
  };

  if (analysisResults) {
    return <Analysis analysisResults={analysisResults} />;
  }

  const hasRecording = audioChunks.length > 0;
  const hasQuestion = form.watch(`question`)?.length > 0;

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
                    placeholder="What question are you answering?"
                    className="min-h-[60px] w-full resize-none bg-transparent px-2 py-[1.3rem] focus-within:outline-none sm:text-sm"
                    autoFocus
                    spellCheck={false}
                    autoComplete="off"
                    autoCorrect="off"
                    name="question"
                    rows={1}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-4">
          <Button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`${isRecording ? `bg-rose-600 text-gray-100 hover:bg-rose-700` : ``}`}
          >
            {isRecording ? (
              <Loader2 className="mr-2 animate-spin" />
            ) : (
              <svg
                className="mr-2 h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="6" />
              </svg>
            )}
            {isRecording ? `Stop Recording` : `Record Answer`}
          </Button>
          <Button
            type="submit"
            disabled={
              isRecording ||
              form.formState.isSubmitting ||
              !hasRecording ||
              !hasQuestion
            }
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              `Submit`
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
