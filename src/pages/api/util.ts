import type {
  NextApiRequest,
  NextApiResponse,
} from "@trpc/server/adapters/next";

import { logger } from "@/init/logger";
import type { AuthenticationContext } from "@/server/services/authentication/context";

/**
 * Base class for Next API routes.
 *
 * This makes it easy to handle errors in API routes plus it allows us to use
 * decorators for things like authentication.
 */
export abstract class NextApiRoute {
  abstract handler(
    req: NextApiRequest,
    res: NextApiResponse,
    authContext?: AuthenticationContext
  ): void | Promise<void>;

  static initHandler(this: {
    new (): NextApiRoute;
  }): (req: NextApiRequest, res: NextApiResponse) => unknown {
    const cls = new this();
    return async (req, res) => {
      try {
        await cls.handler(req, res);
      } catch (err) {
        logger.error(err, `Uncaught error handling Next API route.`);

        const e = err as Error;

        // If the thrown error has an statusCode property, use that as the
        // response status code. Otherwise, default to 500.
        const status =
          `statusCode` in e && typeof e.statusCode === `number`
            ? e.statusCode
            : 500;

        // If the thrown error has an error property, use that as the
        // error key in the response body. Otherwise, default to the error
        // message.
        const body = {
          success: false,
          error:
            `error` in e ? e.error : e.message || `An unknown error occurred`,
        };

        return res.status(status).json(body);
      }
    };
  }
}
