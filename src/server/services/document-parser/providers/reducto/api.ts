import type { EmptyObject } from "type-fest";
import { z } from "zod";

import { env } from "@/env";
import { reductoParseResponseSchema } from "@/server/services/document-parser/providers/types";
import type { ApiCallConfig } from "@/utils/api";
import { ApiClient } from "@/utils/api";

const API_URL = `https://v1.api.reducto.ai/`;

const parseDocumentApiCallBody = z.object({
  document_url: z.string(),
  config: z.object({
    table_output_format: z.enum([`md`, `html`]),
    page_start: z.number().optional(),
    page_end: z.number().optional(),
    force_url_result: z.boolean(),
  }),
});

const parseDocumentApiCall: ApiCallConfig<
  EmptyObject,
  z.infer<typeof parseDocumentApiCallBody>,
  z.infer<typeof reductoParseResponseSchema>
> = {
  method: `POST`,
  url: `/parse`,
  queryParamsSchema: z.object({}),
  bodyParamsSchema: parseDocumentApiCallBody,
  responseSchema: reductoParseResponseSchema,
};

class ReductoApi extends ApiClient {
  constructor() {
    super(API_URL);

    this.axiosInstance.interceptors.request.use(
      (config) => {
        config.headers.authorization = `Bearer ${env.REDUCTO_API_KEY}`;

        return config;
      },
      // eslint-disable-next-line promise/prefer-await-to-callbacks
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  async parse({
    documentUrl,
    pageRange,
    tableOutputFormat = `md`,
  }: {
    documentUrl: string;
    pageRange?: {
      pageRangeStart: number;
      pageRangeEnd: number;
    };
    tableOutputFormat?: `md` | `html`;
  }) {
    const response = await this.call(
      parseDocumentApiCall,
      {},
      {
        document_url: documentUrl,
        config: {
          table_output_format: tableOutputFormat,
          page_start: pageRange?.pageRangeStart,
          page_end: pageRange?.pageRangeEnd,
          force_url_result: true,
        },
      }
    );

    return response;
  }
}

const reductoApi = new ReductoApi();
export default reductoApi;
