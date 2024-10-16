import type { EmptyObject } from "type-fest";
import { z } from "zod";

import { env } from "@/env";
import type { StationAbbreviation } from "@/server/services/transit/bart/types";
import {
  bartApiResponseSchema,
  BartDepartureSortType,
  BartDirection,
  stationAbbreviations,
} from "@/server/services/transit/bart/types";
import type { ApiCallConfig } from "@/utils/api";
import { ApiClient } from "@/utils/api";

const API_URL = `https://api.bart.gov/api/`;

const getRealtimeDeparturesApiCallQueryParams = z.object({
  cmd: z.literal(`etd`),
  orig: z.enum(stationAbbreviations),
  plat: z.enum([`1`, `2`, `3`, `4`]).optional(),
  dir: z.nativeEnum(BartDirection).optional(),
  gbColor: z.nativeEnum(BartDepartureSortType).optional(),
  json: z.literal(`y`),
});

const getRealtimeDeparturesApiCall: ApiCallConfig<
  z.infer<typeof getRealtimeDeparturesApiCallQueryParams>,
  EmptyObject,
  z.infer<typeof bartApiResponseSchema>
> = {
  method: `GET`,
  url: `/etd.aspx`,
  queryParamsSchema: getRealtimeDeparturesApiCallQueryParams,
  bodyParamsSchema: z.object({}),
  responseSchema: bartApiResponseSchema,
};

class BartApi extends ApiClient {
  constructor() {
    super(API_URL);

    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Define the default query parameters
        const defaultParams = {
          key: env.BART_API_KEY,
        };

        // Merge default query parameters with existing ones
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        config.params = {
          ...defaultParams,
          ...config.params,
        };

        return config;
      },
      // eslint-disable-next-line promise/prefer-await-to-callbacks
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  async getRealtimeDepartures({
    orig,
    plat,
    dir,
    gbColor,
  }: {
    orig: StationAbbreviation;
    plat?: `1` | `2` | `3` | `4`;
    dir?: BartDirection;
    gbColor?: BartDepartureSortType;
  }) {
    const response = await this.call(
      getRealtimeDeparturesApiCall,
      {
        cmd: `etd`,
        orig,
        plat,
        dir,
        gbColor,
        json: `y`,
      },
      {}
    );

    return response;
  }
}

const bartApi = new BartApi();
export default bartApi;
