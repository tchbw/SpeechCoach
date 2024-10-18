"use server";

import { z } from "zod";

import { logger } from "@/init/logger";
import { AIUtil } from "@/server/util/ai";
import { SpeechAnalyzer } from "@/utils/speechAnalyzer";
import { SpeechComparer } from "@/utils/speechComparer";

export async function generateWithAudio(formData: FormData) {
  logger.info({ formData }, `Received form data:`);
  const formSchema = z.object({
    question: z.string(),
    audio: z.instanceof(File),
    audioDuration: z.string().transform((value) => parseFloat(value)),
  });

  const parsedFormData = formSchema.parse({
    question: formData.get(`question`),
    audio: formData.get(`audio`),
    audioDuration: formData.get(`audioDuration`),
  });

  const { question, audio: audioFile, audioDuration } = parsedFormData;

  if (!question || !audioFile) {
    throw new Error(`Missing required fields`);
  }

  logger.info(`Received question: ${question}`);
  logger.info(`Received audio file: ${audioFile.name}`);

  const transcription = await AIUtil.transcribeAudio(audioFile);

  const analysisResults = {
    speakingPace: SpeechAnalyzer.speakingPace(transcription, audioDuration),
    gradeLevel: SpeechAnalyzer.gradeLevel(transcription),
    topWords: SpeechAnalyzer.topNWords(transcription, 10),
    fillerWords: SpeechAnalyzer.fillerWordCount(transcription),
    structure: await SpeechAnalyzer.structure(question, transcription),
    reference: await SpeechComparer.getReferenceComparison({
      name: `J.D. Vance`,
      question,
      userResponse: transcription,
    }),
  };

  logger.info(analysisResults, `Analysis results:`);
  return analysisResults;
}
