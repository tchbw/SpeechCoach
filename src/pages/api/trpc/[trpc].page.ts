import { createNextApiHandler } from "@trpc/server/adapters/next";

import { env } from "@/env";
import { logger } from "@/init/logger";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    env.NODE_ENV === `development`
      ? ({ path, error }) => {
          logger.error(
            { path, error },
            `❌ tRPC failed on ${path ?? `<no-path>`}: ${error.message}`
          );
        }
      : undefined,
});
