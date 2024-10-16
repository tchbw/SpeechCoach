import { webcrypto } from "node:crypto";

import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { setCookie } from "cookies-next";
import type { DefaultOptions } from "cookies-next/src/types";
import { Lucia } from "lucia";
import { type GetServerSidePropsContext } from "next";
import type { NextRequest } from "next/server";

import { env } from "@/env";
import { prisma } from "@/server/init/db";
import { UserSessionContext } from "@/server/services/authentication/context";

globalThis.crypto = webcrypto as Crypto;

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    // this sets cookies with super long expiration
    // since Next.js doesn't allow Lucia to extend cookie expiration when rendering pages
    expires: false,
    attributes: {
      // set to `true` when using HTTPS
      secure: process.env.NODE_ENV === `production`,
    },
  },
});

/**
 * Gets current session (if any) from a NextJS Page router request
 */
export async function getSessionNextJS({
  req,
  res,
}: {
  req: GetServerSidePropsContext[`req`];
  res: GetServerSidePropsContext[`res`];
}): Promise<UserSessionContext | null> {
  const sessionId = lucia.readSessionCookie(req.headers.cookie ?? ``);
  if (!sessionId) {
    return null;
  }

  const result = await lucia.validateSession(sessionId);
  if (result.session && result.session.fresh) {
    res.appendHeader(
      `Set-Cookie`,
      lucia.createSessionCookie(result.session.id).serialize()
    );
  }
  if (!result.session) {
    res.appendHeader(
      `Set-Cookie`,
      lucia.createBlankSessionCookie().serialize()
    );
    return null;
  }

  return new UserSessionContext({
    session: result.session,
    userId: result.user.id,
  });
}

/**
 * Gets current session (if any) from a NextJS App router request
 */
export async function getSessionFromNextAppRouterRequest({
  req,
}: {
  req: NextRequest;
}): Promise<UserSessionContext | null> {
  const sessionId = lucia.readSessionCookie(req.headers.get(`cookie`) ?? ``);
  if (!sessionId) {
    return null;
  }

  const result = await lucia.validateSession(sessionId);
  if (result.session && result.session.fresh) {
    req.headers.set(
      `Set-Cookie`,
      lucia.createSessionCookie(result.session.id).serialize()
    );
  }
  if (!result.session) {
    req.headers.set(`Set-Cookie`, lucia.createBlankSessionCookie().serialize());
    return null;
  }

  return new UserSessionContext({
    session: result.session,
    userId: result.user.id,
  });
}

/**
 * Sets a session cookie for a NextJS Page router request. Should be called after authenticating
 */
export async function setSessionCookieNextJS(
  req: DefaultOptions[`req`],
  res: DefaultOptions[`res`],
  userId: string
) {
  const session = await lucia.createSession(userId, {});

  const cookie = lucia.createSessionCookie(session.id);
  setCookie(cookie.name, cookie.value, {
    req,
    res,
    expires: session.expiresAt,
    httpOnly: true,
    secure: !env.NEXT_PUBLIC_APP_URL.startsWith(`http://`),
    sameSite: `lax`, // need lax instead of strict so the cookie set when clicking login link from email
  });
}

/**
 * Clears session cookie on logout
 */
export async function clearSessionCookieNextJS(
  req: GetServerSidePropsContext[`req`],
  res: GetServerSidePropsContext[`res`]
) {
  const session = await getSessionNextJS({
    req,
    res,
  });
  if (!session) {
    return;
  }

  await lucia.invalidateSession(session.session.id);
  res.setHeader(`Set-Cookie`, lucia.createBlankSessionCookie().serialize());
}
