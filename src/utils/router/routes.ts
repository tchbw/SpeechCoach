import { z } from "zod";

import { makeRoute } from "@/utils/router/declarative-routing";

export const Routes = {
  login: makeRoute(
    () => `/login`,
    z.object({}),
    z.object({
      redirectUrl: z.string().optional(),
      email: z.string().optional(),
      error: z.string().optional(),
    })
  ),

  logout: makeRoute(() => `/logout`),
  landing: makeRoute(() => `/`),
  appHome: makeRoute(() => `/user/profile`),
  postLogin: makeRoute(() => `/post-login`),
  account: makeRoute(() => `/user/account`),

  // TODO: figure out how to nest these routes
  company: {
    base: makeRoute(
      ({ orgSlug }) => `/o/${orgSlug}`,
      z.object({
        orgSlug: z.string(),
      })
    ),
    dashboard: makeRoute(
      ({ orgSlug }) => `/o/${orgSlug}/dashboard`,
      z.object({
        orgSlug: z.string(),
      })
    ),
    project: {
      home: makeRoute(
        ({ orgSlug, projectId }) => `/o/${orgSlug}/project/${projectId}`,
        z.object({
          orgSlug: z.string(),
          projectId: z.string(),
        })
      ),
      new: makeRoute(
        ({ orgSlug }) => `/o/${orgSlug}/project/new`,
        z.object({
          orgSlug: z.string(),
        })
      ),
    },
  },
};
