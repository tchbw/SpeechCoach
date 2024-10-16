import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getSessionFromNextAppRouterRequest } from "@/server/auth";
import type { AuthenticationContext } from "@/server/services/authentication/context";
import { APIUnauthenticatedError } from "@/server/util/errors";

/**
 * Protects Next API app routes that require authentication.
 */
export function ProtectedAppRoute({
  fn,
  redirectToLogin,
}: {
  fn: (
    req: NextRequest,
    authContext: AuthenticationContext
  ) => Promise<Response>;
  redirectToLogin?: boolean;
}) {
  return async function (req: NextRequest) {
    const authContext = await getSessionFromNextAppRouterRequest({ req });
    if (!authContext) {
      if (redirectToLogin) {
        let redirect = `/login`;
        if (req.url) {
          redirect += `?redirectUrl=${req.url}`;
        }

        return NextResponse.redirect(redirect);
      }
      throw new APIUnauthenticatedError(`Authentication required`);
    }

    return await fn(req, authContext);
  };
}
