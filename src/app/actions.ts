"use server";

import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { createStreamableValue } from "ai/rsc";

import type {
  PartialReligionQA,
  ReligionQA,
  ReligionQAForm,
} from "@/app/types";
import { religionQASchema } from "@/app/types";

// eslint-disable-next-line @typescript-eslint/require-await
export async function generate({ question }: ReligionQAForm) {
  "use server";

  const stream = createStreamableValue<PartialReligionQA, ReligionQA>();

  void (async () => {
    const { partialObjectStream } = await streamObject<ReligionQA>({
      model: openai(`gpt-4o-mini`),
      system:
        `You are an assistant that roleplays as spiritual figures of various religions. ` +
        `The user is asking a question and wants to know how it pertains to different religions. ` +
        `Given the user's question, provide a response from the perspective of Christianity, Islam, and Buddhism. ` +
        `Do not include responses for any other religions besides these 3. ` +
        `Cite sources from religious texts like the Bible, Qur'an, etc. `,
      prompt: `Please answer the following question: "${question}"`,
      schema: religionQASchema,
      // onFinish({ object }) {
      // },
    });

    for await (const partialObject of partialObjectStream) {
      stream.update(partialObject);
    }

    stream.done();
  })();

  return { object: stream.value };
}
