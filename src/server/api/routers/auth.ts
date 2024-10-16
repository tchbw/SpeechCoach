import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { setSessionCookieNextJS } from "@/server/auth";
import {
  AuthenticationError,
  EmailNotFoundError,
} from "@/server/services/authentication/errors";
import authenticationService from "@/server/services/authentication/service";

export const authRouter = createTRPCRouter({
  emailLoginCode: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        redirectUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input: { email, redirectUrl } }) => {
      try {
        await authenticationService.emailLoginCode({ email, redirectUrl });
      } catch (error) {
        if (error instanceof EmailNotFoundError) {
          // do nothing so we don't leak whether an email is registered
        } else {
          throw error;
        }
      }
    }),

  verifyLoginCode: publicProcedure
    .input(
      z.object({
        email: z.string(),
        code: z.string(),
      })
    )
    .mutation(async ({ ctx: { req, res }, input: { email, code } }) => {
      try {
        // verify the login code and create a user session
        const { authenticatedUserId } =
          await authenticationService.verifyLoginCode({
            email,
            code,
          });

        // set the session cookie
        await setSessionCookieNextJS(req, res, authenticatedUserId);

        return { valid: true };
      } catch (err) {
        if (err instanceof AuthenticationError) {
          return { valid: false, error: err.message };
        } else {
          throw err;
        }
      }
    }),

  loginWithPassword: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ ctx: { req, res }, input: { email, password } }) => {
      try {
        // verify the login code and create a user session
        const { authenticatedUserId } =
          await authenticationService.verifyPassword({ email, password });

        // set the session cookie
        await setSessionCookieNextJS(req, res, authenticatedUserId);

        return { valid: true };
      } catch (err) {
        if (err instanceof AuthenticationError) {
          return { valid: false, error: err.message };
        } else {
          throw err;
        }
      }
    }),

  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string(),
        newPassword: z.string(),
        confirmPassword: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { currentPassword, newPassword, confirmPassword } = input;

      if (newPassword !== confirmPassword) {
        throw new Error(`New passwords do not match`);
      }

      await authenticationService.changePassword({
        userId: ctx.authContext.userId,
        currentPassword,
        newPassword,
      });

      return { success: true };
    }),
});
