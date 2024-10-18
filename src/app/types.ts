import type { DeepPartial } from "ai";
import { z } from "zod";

/*
  Form types
*/
export const religionQAFormSchema = z.object({
  question: z.string().min(1, `Question is required`),
});

export type ReligionQAForm = z.infer<typeof religionQAFormSchema>;

/*
  QA response types
*/
export enum Religion {
  CHRISTIANITY = `Christianity`,
  ISLAM = `Islam`,
  // HINDUISM = `Hinduism`,
  BUDDHISM = `Buddhism`,
  // JEWISH = `Jewish`,
}

const religionQAResponseSchema = z.object({
  religion: z.nativeEnum(Religion),
  message: z
    .string()
    .describe(
      `The response to the question, written in first person from the perspective of a spiritual leader of the religion. Use markdown bolding whenever appropriate to highlight key words and phrases`
    ),
  sources: z.array(
    z.object({
      quote: z.string(),
      sourceDescription: z
        .string()
        .describe(`A source citation for the quote. For example, John 1:2`),
    })
  ),
});
export const religionQASchema = z.object({
  qaResponses: z.array(religionQAResponseSchema),
});

// define a type for the partial notifications during generation
export type PartialReligionQA = DeepPartial<typeof religionQASchema>;

export type ReligionQA = z.infer<typeof religionQASchema>;

export type ReligionQAResponse = z.infer<typeof religionQAResponseSchema>;
export type PartialReligionQAResponse = DeepPartial<ReligionQAResponse>;

export type SpeechAnalysis = {
  speakingPace: number;
  gradeLevel: number;
  topWords: Record<string, number>;
  fillerWords: Record<string, number>;
  structure: string[];
  reference: {
    impersonatedResponse: string;
    impersonatedResponseStructure: string[];
    feedbackToMatchReference: string;
    referenceSpeakingPace: number;
    referenceGradeLevel: number;
  };
};
