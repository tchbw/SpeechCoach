import type { Company, CompanyMember, User } from "@prisma/client";
import assert from "assert";
import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";

import { logger } from "@/init/logger";
import { getSessionNextJS } from "@/server/auth";
import { prisma } from "@/server/init/db";
import type { UserSessionContext } from "@/server/services/authentication/context";
import { UserService } from "@/server/services/user/service";
import { APIForbiddenError, APINotFoundError } from "@/server/util/errors";
import { Routes } from "@/utils/router/routes";

export const RequireUser = <Props>(
  getServerSidePropsFn: ({
    ctx,
    authContext,
    user,
  }: {
    ctx: GetServerSidePropsContext;
    authContext: UserSessionContext;
    user: User & {
      Companies: (CompanyMember & {
        company: Company;
      })[];
    };
  }) =>
    | Promise<GetServerSidePropsResult<Props>>
    | GetServerSidePropsResult<Props>,
  { isLogout = false, email }: { isLogout?: boolean; email?: string } = {}
) => {
  return async (context: GetServerSidePropsContext) => {
    const authContext = await getSessionNextJS({
      req: context.req,
      res: context.res,
    });

    if (!authContext) {
      return {
        redirect: {
          destination: isLogout
            ? Routes.login()
            : Routes.login(
                {},
                {
                  search: {
                    redirectUrl: context.resolvedUrl,
                    email,
                  },
                }
              ),
          permanent: false,
        },
      };
    }

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: authContext.userId },
      include: {
        Companies: {
          include: {
            company: true,
          },
        },
      },
    });

    return getServerSidePropsFn({
      ctx: context,
      authContext,
      user,
    });
  };
};

export const RequireCompany = <Props>(
  getServerSidePropsFn: ({
    ctx,
    authContext,
    user,
  }: {
    ctx: GetServerSidePropsContext;
    authContext: UserSessionContext;
    user: User;
    company: Company;
  }) =>
    | Promise<GetServerSidePropsResult<Props>>
    | GetServerSidePropsResult<Props>
) => {
  return async (context: GetServerSidePropsContext) => {
    const authContext = await getSessionNextJS({
      req: context.req,
      res: context.res,
    });

    if (!authContext) {
      return {
        redirect: {
          destination: Routes.login(
            {},
            {
              search: {
                redirectUrl: context.resolvedUrl,
              },
            }
          ),
          permanent: false,
        },
      };
    }

    const userService = UserService.withContext(authContext);

    const user = await userService.getUser(authContext.userId);
    const companies = await userService.getCompanies({
      userId: authContext.userId,
    });

    assert(authContext, `Session not found`);
    assert(user, `User not found`);

    const companySlug = context.resolvedUrl?.match(/^\/o\/([^\/]+)/)?.[1];
    const company = companies.find((company) => company.slug === companySlug);
    if (!company) {
      logger.info(
        { user, companies, companySlug },
        `User is not a member of company`
      );
      return {
        notFound: true,
      };
    }

    try {
      return await getServerSidePropsFn({
        ctx: context,
        authContext,
        user,
        company,
      });
    } catch (error: unknown) {
      if (
        error instanceof APIForbiddenError ||
        error instanceof APINotFoundError
      ) {
        return {
          notFound: true,
        };
      }

      throw error;
    }
  };
};

export const RequireUnauthenticated = <Props>(
  getServerSidePropsFn: ({
    ctx,
  }: {
    ctx: GetServerSidePropsContext;
  }) =>
    | Promise<GetServerSidePropsResult<Props>>
    | GetServerSidePropsResult<Props>
) => {
  return async (context: GetServerSidePropsContext) => {
    const session = await getSessionNextJS({
      req: context.req,
      res: context.res,
    });

    if (session) {
      return {
        redirect: {
          destination: Routes.postLogin(),
          permanent: false,
        },
      };
    }

    return getServerSidePropsFn
      ? await getServerSidePropsFn({ ctx: context })
      : { props: {} };
  };
};
