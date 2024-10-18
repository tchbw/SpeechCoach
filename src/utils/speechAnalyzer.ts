import Instructor from "@instructor-ai/instructor";
import { flatten } from "lodash-es";
import { z } from "zod";

import nlp from "@/init/nlp";
import { openai } from "@/server/init/openai";
import { assertUnreachable } from "@/server/util/types";

const client = Instructor({ client: openai, mode: `JSON`, debug: true });

export const SpeechAnalyzer = {
  speakingPace(transcript: string, durationInSeconds: number): number {
    const words = transcript.split(/\s+/).length;
    const minutes = durationInSeconds / 60;
    return Math.round(words / minutes);
  },

  gradeLevel(
    transcript: string,
    algorithm: `flesch-kincaid` | `coleman-liau` = `flesch-kincaid`
  ): number {
    const sentences = nlp(transcript).sentences().length;
    const words = nlp(transcript).terms().length;
    const syllables = flatten(nlp(transcript).syllables()).length;

    switch (algorithm) {
      case `flesch-kincaid`:
        return Math.round(
          0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59
        );
      case `coleman-liau`:
        const L = (words / sentences) * 100;
        const S = (syllables / words) * 100;
        return Math.round(0.0588 * L - 0.296 * S - 15.8);
      default:
        assertUnreachable(algorithm, `Unsupported algorithm`);
    }
  },

  topNWords(
    transcript: string,
    n: number,
    excludeCommonWords: boolean = true
  ): Record<string, number> {
    const words = nlp(transcript).terms();
    const wordCounts: Record<string, number> = {};

    const commonWords = new Set([
      `the`,
      `be`,
      `to`,
      `of`,
      `and`,
      `a`,
      `in`,
      `that`,
      `have`,
      `i`,
      `it`,
      `for`,
      `not`,
      `on`,
      `with`,
      `he`,
      `as`,
      `you`,
      `do`,
      `at`,
    ]);

    for (const word of words.termList()) {
      if (word.text === `...`) continue;
      if (!excludeCommonWords || !commonWords.has(word.text)) {
        wordCounts[word.text] = (wordCounts[word.text] || 0) + 1;
      }
    }

    return Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .reduce(
        (acc, [word, count]) => {
          acc[word] = count;
          return acc;
        },
        {} as Record<string, number>
      );
  },

  fillerWordCount(transcript: string): Record<string, number> {
    const fillerWords = [
      `um`,
      `uh`,
      `er`,
      `ah`,
      `like`,
      `you know`,
      `sort of`,
      `kind of`,
      `basically`,
      `literally`,
      `actually`,
      `so`,
      `well`,
    ];

    const result: Record<string, number> = {};
    const words = transcript.toLowerCase().split(/\s+/);

    for (const fillerWord of fillerWords) {
      const count = words.filter((word) => word === fillerWord).length;
      if (count > 0) {
        result[fillerWord] = count;
      }
    }

    return result;
  },

  async structure(question: string, answer: string): Promise<string[]> {
    const StructureSchema = z.object({
      structure: z
        .string()
        .array()
        .describe(
          `An array of strings, where each array item describes a general structure within the answer.`
        ),
    });

    const response = await client.chat.completions.create({
      messages: [
        {
          role: `system`,
          content: `You are an expert in analyzing speech and text structure. Return a JSON object with structure of the user's response.

Example:
Question: "Let’s turn now to Hurricane Helene. The storm could become one of the deadliest on record. More than 160 people are dead and hundreds more are missing. Scientists say climate change makes these hurricanes larger, stronger, and more deadly because of the historic rainfall. Senator Vance, according to CBS News polling, 7 in 10 Americans, and more than 60% of Republicans under the age of 45, favor the US taking steps to try and reduce climate change. Senator, what responsibility would the Trump administration have to try and reduce the impact of climate change? I’ll give you two minutes."

Answer: "Sure. So first of all, let’s start with the hurricane because it’s an unbelievable unspeakable human tragedy. I just saw today, actually, a photograph of two grandparents on a roof with a six-year-old child, and it was the last photograph ever taken of them because the roof collapsed and those innocent people lost their lives. And I’m sure Governor Walz joins me in saying our hearts go out to those innocent people, our prayers go out to them. And we want as robust and aggressive as a federal response as we can get to save as many lives as possible. And then of course, afterwards, to help the people in those communities rebuild. I mean, these are communities that I love. Some of them I know very personally. In Appalachia, all across the southeast, they need their government to do their job. And I commit that when Donald Trump is president again, the government will put the citizens of this country first when they suffer from a disaster.

Now, Nora, you asked about climate change. I think this is a very important issue. Look, a lot of people are justifiably worried about all these crazy weather patterns. I think it’s important for us, first of all, to say Donald Trump and I support clean air, clean water. We want the environment to be cleaner and safer. But one of the things that I’ve noticed some of our Democratic friends talking a lot about, is a concern about carbon emissions. This idea that carbon emissions drives all of the climate change. Well, let’s just say that’s true, just for the sake of argument, so we’re not arguing about weird science, let’s just say that’s true. Well, if you believe that, what would you want to do? The answer is that you’d want to re-shore as much American manufacturing as possible, and you’d want to produce as much energy as possible in the United States of America because we’re the cleanest economy in the entire world.

What have Kamala Harris’s policies actually led to? More energy production in China, more manufacturing overseas, more doing business in some of the dirtiest parts of the entire world. And when I say that, I mean the amount of carbon emissions they’re doing per unit of economic output. So if we actually care about getting cleaner air and cleaner water, the best thing to do is to double down and invest in American workers and the American people. And unfortunately, Kamala Harris has done exactly the opposite."

Response: {"structure":["Universal Statement to Establish Common Ground", "Emotional Appeal through Anecdote", "Reassurance and Call for Federal Response", "Direct acknowledgement of the question", "Positioning Trump and Himself as Pro-Environment", "Reframing the argument from a Manufacturing and Energy Production perspective to drive the narrative", "Attacking the opponent's positions to create contrast", "Offering a clear, action oriented solution"]}
`,
        },
        {
          role: `user`,
          content: `Analyze the structure of this answer to the question: "${question}"\n\nAnswer: ${answer}`,
        },
      ],
      model: `gpt-4o-mini`,
      response_model: { schema: StructureSchema, name: `Structure` },
    });

    return response.structure;
  },
};
