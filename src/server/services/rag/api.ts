import { z } from "zod";

import { env } from "@/env";
import type { ApiCallConfig } from "@/utils/api";
import { ApiClient } from "@/utils/api";

const API_URL = `https://api.ragie.ai`;

const createDocumentFromUrlApiCallBodyParams = z.object({
  mode: z.enum([`hi_res`, `fast`]),
  name: z.string().describe(`The name of the document`),
  url: z
    .string()
    .url()
    .describe(`The URL of the document. Must be publicly accessible.`),
  metadata: z.record(z.unknown()).optional(),
});

const createDocumentFromUrlApiCallResponseSchema = z.object({
  id: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  status: z.string(),
  name: z.string(),
  metadata: z.record(z.unknown()),
  chunk_count: z.number().nullish(),
  external_id: z.string().nullish(),
});

const createDocumentFromUrlApiCall: ApiCallConfig<
  Record<string, never>,
  z.infer<typeof createDocumentFromUrlApiCallBodyParams>,
  z.infer<typeof createDocumentFromUrlApiCallResponseSchema>
> = {
  method: `POST`,
  url: `/documents/url`,
  queryParamsSchema: z.object({}),
  bodyParamsSchema: createDocumentFromUrlApiCallBodyParams,
  responseSchema: createDocumentFromUrlApiCallResponseSchema,
};

class RagieApi extends ApiClient {
  constructor() {
    super(API_URL);

    this.axiosInstance.defaults.headers.common[`Authorization`] =
      `Bearer ${env.RAGIE_API_KEY}`;
  }

  async createDocumentFromUrl({
    mode,
    name,
    url,
    metadata,
  }: z.infer<typeof createDocumentFromUrlApiCallBodyParams>) {
    const response = await this.call(
      createDocumentFromUrlApiCall,
      {},
      { mode, name, url, metadata }
    );

    return response;
  }
}

const ragieApi = new RagieApi();
export default ragieApi;
