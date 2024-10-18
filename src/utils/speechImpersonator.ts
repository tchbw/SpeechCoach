import Instructor from "@instructor-ai/instructor";
import { z } from "zod";

import { openai } from "@/server/init/openai";

const client = Instructor({ client: openai, mode: `JSON`, debug: true });

const ResponseSchema = z.object({
  response: z.string().describe(`The impersonated response to the question`),
});

export const SpeechImpersonator = {
  async impersonateResponse(name: string, question: string): Promise<string> {
    const response = await client.chat.completions.create({
      messages: [
        {
          role: `system`,
          content: `You are an expert at impersonating various public figures. You will be given a name and a question. Your task is to provide a response as if you were that person, mimicking their speaking style, mannerisms, and typical viewpoints. Keep the response concise and relevant to the question.`,
        },
        {
          role: `user`,
          content: `Impersonate ${name} and answer the following question: "${question}"`,
        },
      ],
      model: `gpt-4o-mini`,
      response_model: { schema: ResponseSchema, name: `ImpersonatedResponse` },
    });

    return response.response;
  },
};
