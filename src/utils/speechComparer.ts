import Instructor from "@instructor-ai/instructor";
import { z } from "zod";

import type { SpeechAnalysis } from "@/app/types";
import { openai } from "@/server/init/openai";
import type { SpeakerConfig } from "@/utils/speakerConfigs";
import { speakerConfigs } from "@/utils/speakerConfigs";
import { SpeechAnalyzer } from "@/utils/speechAnalyzer";
import { SpeechImpersonator } from "@/utils/speechImpersonator";

const client = Instructor({ client: openai, mode: `JSON`, debug: true });

const FeedbackSchema = z.object({
  feedback: z
    .string()
    .describe(
      `Feedback on how to closer match the reference person's speaking style`
    ),
});

export const SpeechComparer = {
  async getReferenceComparison({
    name,
    question,
    userResponse,
  }: {
    name: SpeakerConfig[`name`];
    question: string;
    userResponse: string;
  }): Promise<SpeechAnalysis[`reference`]> {
    const impersonatedResponse = await SpeechImpersonator.impersonateResponse(
      name,
      question
    );
    const impersonatedResponseStructure = await SpeechAnalyzer.structure(
      question,
      impersonatedResponse
    );
    const userResponseStructure = await SpeechAnalyzer.structure(
      question,
      userResponse
    );

    const response = await client.chat.completions.create({
      messages: [
        {
          role: `system`,
          content: `You are an expert in speech analysis and comparison. Provide feedback on how the user's response can be improved to better match the speaking style of the reference person.`,
        },
        {
          role: `user`,
          content: `
Reference Person: ${name}
Question: "${question}"
Reference Response: "${impersonatedResponse}"
Reference Structure: ${JSON.stringify(impersonatedResponseStructure)}
User Response: "${userResponse}"
User Structure: ${JSON.stringify(userResponseStructure)}

Provide feedback on how the user's response can be improved to better match the speaking style of ${name}.`,
        },
      ],
      model: `gpt-4o-mini`,
      response_model: { schema: FeedbackSchema, name: `Feedback` },
    });

    return {
      impersonatedResponse,
      impersonatedResponseStructure: impersonatedResponseStructure,
      feedbackToMatchReference: response.feedback,
      referenceSpeakingPace: speakerConfigs[name].avgWordsPerMinute,
      referenceGradeLevel: speakerConfigs[name].gradeLevel,
    };
  },
};
