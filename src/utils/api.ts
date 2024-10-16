/**
 * This is the client-side entrypoint for your tRPC API. It is used to create the `api` object which
 * contains the Next.js App-wrapper, as well as your type-safe React Query hooks.
 *
 * We also create a few inference helpers for input and output types.
 */
import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import type { AxiosInstance, AxiosRequestConfig } from "axios";
import axios from "axios";
import type { z } from "zod";

import { logger } from "@/init/logger";
import superjson from "@/init/superjson";
import { type AppRouter } from "@/server/api/root";

const getBaseUrl = () => {
  if (typeof window !== `undefined`) return ``; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

/** A set of type-safe react-query hooks for your tRPC API. */
export const api = createTRPCNext<AppRouter>({
  config() {
    return {
      /**
       * Links used to determine request flow from client to server.
       *
       * @see https://trpc.io/docs/links
       */
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === `development` ||
            (opts.direction === `down` && opts.result instanceof Error),
        }),
        httpBatchLink({
          /**
           * Transformer used for data de-serialization from the server.
           *
           * @see https://trpc.io/docs/data-transformers
           */
          transformer: superjson,
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
    };
  },
  /**
   * Whether tRPC should await queries when server rendering pages.
   *
   * @see https://trpc.io/docs/nextjs#ssr-boolean-default-false
   */
  ssr: false,
  transformer: superjson,
});

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;

/**
 * A generic API client for making API calls outside of trpc
 */
// Define a generic API call function
export type ApiCallConfig<TQueryParams, TBodyParams, TResponse> = {
  method: `GET` | `POST` | `PUT` | `DELETE`;
  url: string;
  queryParamsSchema: z.ZodType<TQueryParams>;
  bodyParamsSchema: z.ZodType<TBodyParams>;
  responseSchema: z.ZodType<TResponse>;
};

// Create an API client
export class ApiClient {
  protected axiosInstance: AxiosInstance;

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({ baseURL });

    this.axiosInstance.interceptors.request.use((request) => {
      logger.info({ request }, `Starting api request to`);
      return request;
    });

    this.axiosInstance.interceptors.response.use((response) => {
      logger.info({ url: response.config.url }, `Response from api`);
      return response;
    });
  }

  async call<TQueryParams, TBodyParams, TResponse>(
    apiCall: ApiCallConfig<TQueryParams, TBodyParams, TResponse>,
    queryParams: TQueryParams,
    bodyParams: TBodyParams
  ): Promise<TResponse> {
    // Validate input parameters
    const validatedQueryParams = apiCall.queryParamsSchema.parse(queryParams);
    const validatedBodyParams = apiCall.bodyParamsSchema.parse(bodyParams);

    // Prepare request config
    const config: AxiosRequestConfig = {
      method: apiCall.method,
      url: apiCall.url,
      params: validatedQueryParams,
      data: validatedBodyParams,
    };

    // Make the API call
    const response = await this.axiosInstance(config);

    // Validate and return the response
    return apiCall.responseSchema.parse(response.data);
  }
}

export const disableRefetchingConfig = {
  refetchOnMount: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
  refetchInterval: false,
} as const;
