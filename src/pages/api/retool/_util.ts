import type { NextApiRequest, NextApiResponse } from "next";

import { logger } from "@/init/logger";
import { NextApiRoute } from "@/pages/api/util";

export const verifyRetoolRequest = (req: NextApiRequest): boolean => {
  return (
    req.headers[`authorization`] === `Bearer ${process.env.RETOOL_API_SECRET}`
  );
};

export type RetoolApiRouteParams = {
  req: NextApiRequest;
  res: NextApiResponse;
};

export abstract class RetoolApiRoute extends NextApiRoute {
  PATCH(_: RetoolApiRouteParams): Promise<void> {
    throw new Error(`Not implemented`);
  }

  PUT(_: RetoolApiRouteParams): Promise<void> {
    throw new Error(`Not implemented`);
  }

  GET(_: RetoolApiRouteParams): Promise<void> {
    throw new Error(`Not implemented`);
  }

  POST(_: RetoolApiRouteParams): Promise<void> {
    throw new Error(`Not implemented`);
  }

  DELETE(_: RetoolApiRouteParams): Promise<void> {
    throw new Error(`Not implemented`);
  }

  async handler(req: NextApiRequest, res: NextApiResponse) {
    if (!verifyRetoolRequest(req)) {
      logger.error(`Unable to authenticate Retool request`);
      return res.status(401).json({
        message: `Unable to authenticate Retool request`,
      });
    }

    const params = {
      req,
      res,
    };

    logger.info({ method: req.method || `UNKNOWN` }, `Retool request`);
    if (req.method === `GET`) {
      return await this.GET(params);
    } else if (req.method === `POST`) {
      return await this.POST(params);
    } else if (req.method === `PATCH`) {
      return await this.PATCH(params);
    } else if (req.method === `PUT`) {
      return await this.PUT(params);
    } else if (req.method === `DELETE`) {
      return await this.DELETE(params);
    } else {
      return res.status(405).json({ message: `Method not allowed` });
    }
  }
}
