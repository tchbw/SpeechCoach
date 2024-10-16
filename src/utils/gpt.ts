import assert from "assert";
import type {
  ChatCompletionCreateParams,
  ChatCompletionMessageParam,
  ChatCompletionTool,
  ChatCompletionToolChoiceOption,
} from "openai/resources/chat/index";

import { logger } from "@/init/logger";
import { openai } from "@/server/init/openai";

type CompletionBaseParams = {
  messages: ChatCompletionMessageParam[];
  tools?: ChatCompletionTool[];
  toolChoice?: ChatCompletionToolChoiceOption;
  temperature?: number;
  seed?: number;
  tag?: string;
};

type CompletionModelParams =
  | {
      model?: `gpt-4` | `gpt-3.5-turbo`;
      responseFormat?: undefined;
    }
  | {
      model?:
        | `gpt-4-1106-preview`
        | `gpt-4-0125-preview`
        | `gpt-4-turbo-preview`
        | `gpt-4o`
        | `gpt-4o-mini`;
      responseFormat?: ChatCompletionCreateParams.ResponseFormat[`type`];
    };

type CompletionParams = CompletionBaseParams & CompletionModelParams;

export type CompletionGPTModels = CompletionModelParams[`model`];

const CONTROL_CHARACTERS_REGEX = /[\u0000-\u001F]/g;

export const GptUtil = {
  async getCompletion({
    messages,
    model = `gpt-4o-mini`,
    tools,
    toolChoice,
    responseFormat = `text`,
    temperature = 0.0,
    seed = 1,
  }: CompletionParams) {
    try {
      logger.info(
        {
          model,
          lastMessage: messages[-1],
          tools,
          toolChoice,
        },
        `Request for function completion`
      );

      const response = await openai.chat.completions.create({
        model,
        messages,
        tools,
        tool_choice: toolChoice,
        temperature,
        response_format: { type: responseFormat },
        seed,
      });

      const completion = response.choices[0];

      assert(completion, `GPT returned no completion`);

      logger.info(
        { completion: completion.message },
        `Returned function completion`
      );

      (completion.message.tool_calls || []).forEach((toolCall) => {
        if (toolCall.function.arguments) {
          // There's characters called control characters which can screw up
          // JSON parsing
          toolCall.function.arguments = toolCall.function.arguments.replace(
            CONTROL_CHARACTERS_REGEX,
            ``
          );
          logger.info(
            `Received function argument response from gpt and filtered control characters`
          );
        }
      });

      return completion.message;
    } catch (error) {
      logger.error(
        {
          error,
        },
        `Error in GPT request`
      );
      throw error;
    }
  },
};
