import { hash, verify } from "@node-rs/argon2";
import type { User } from "@prisma/client";
import { nanoid } from "nanoid";

import { env } from "@/env";
import dayjs from "@/init/dayjs";
import { logger } from "@/init/logger";
import { prisma } from "@/server/init/db";
import {
  EmailNotFoundError,
  LoginCodeAlreadyUsedError,
  LoginCodeExpiredError,
  LoginCodeInvalidError,
  PasswordInvalidError,
  PasswordNotConfiguredError,
} from "@/server/services/authentication/errors";
import { createLoginCodeHash } from "@/server/services/authentication/util";
import emailService from "@/server/services/email/service";
import LoginCode from "@/server/services/email/templates/LoginCode";

class AuthenticationService {
  public async emailLoginCode({
    email,
    redirectUrl,
  }: {
    email: string;
    redirectUrl?: string;
  }): Promise<void> {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      logger.info({ email }, `New user detected. Creating...`);
      await prisma.user.create({
        data: {
          name: email,
          email,
        },
      });
    }
    logger.info({ email }, `Sending login email...`);
    // send the login email to the user
    await emailService.sendTransactionalEmail({
      to: email,
      subject: `Login to ${env.NEXT_PUBLIC_APP_NAME}`,
      body: (
        <LoginCode
          inviteLink={await this.generateMagicLink({ email, redirectUrl })}
        />
      ),
    });
  }

  public async verifyLoginCode({
    email,
    code,
  }: {
    email: string;
    code: string;
  }): Promise<{ authenticatedUserId: string }> {
    const codeRecord = await prisma.loginCode.findUnique({
      where: { codeHash: createLoginCodeHash({ code, email }) },
      include: { User: true },
    });

    if (!codeRecord || codeRecord.User.email !== email) {
      throw new LoginCodeInvalidError();
    }

    if (codeRecord.verified) {
      throw new LoginCodeAlreadyUsedError();
    }

    if (codeRecord.expires < new Date()) {
      throw new LoginCodeExpiredError();
    }

    // mark email as verified since the login code was sent to their email
    await prisma.user.updateMany({
      where: { email, emailVerified: null },
      data: {
        email,
        emailVerified: new Date(),
      },
    });

    // mark login code as used
    await prisma.loginCode.update({
      where: { id: codeRecord.id },
      data: { verified: new Date() },
    });

    return {
      authenticatedUserId: codeRecord.userId,
    };
  }

  // TODO: Make this class extend BaseService and implement stricter permission checks
  public async setUserPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new EmailNotFoundError();
    }

    // TODO: add password strength validations

    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });
  }

  public async verifyPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new EmailNotFoundError();
    }

    if (!user.passwordHash) {
      throw new PasswordNotConfiguredError();
    }

    const isValid = await verify(user.passwordHash, password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    if (!isValid) {
      throw new PasswordInvalidError();
    }

    return {
      authenticatedUserId: user.id,
    };
  }

  public async generateMagicLink({
    email,
    redirectUrl,
  }: {
    email: string;
    redirectUrl?: string;
  }) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new EmailNotFoundError();
    }

    // create login code
    const { code } = await this.createLoginCode({
      user,
      expires: dayjs().add(1, `day`).toDate(),
    });

    return `${env.NEXT_PUBLIC_APP_URL}/login-verify?email=${encodeURIComponent(
      email
    )}&code=${encodeURIComponent(code)}${
      redirectUrl ? `&redirectUrl=${encodeURIComponent(redirectUrl)}` : ``
    }`;
  }

  private async createLoginCode({
    user,
    expires,
  }: {
    user: User;
    expires?: Date;
  }) {
    const code = nanoid();
    const record = await prisma.loginCode.create({
      data: {
        codeHash: createLoginCodeHash({ code, email: user.email }),
        userId: user.id,
        expires: expires ?? new Date(Date.now() + 1000 * 60 * 5), // 5 minutes
      },
    });

    return { code, record };
  }

  public async changePassword({
    userId,
    currentPassword,
    newPassword,
  }: {
    userId: string;
    currentPassword: string;
    newPassword: string;
  }) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error(`User not found`);
    }

    if (!user.email) {
      throw new Error(`User email not found`);
    }

    // Verify the current password
    await this.verifyPassword({
      email: user.email,
      password: currentPassword,
    });

    // Set the new password
    await this.setUserPassword({
      email: user.email,
      password: newPassword,
    });
  }
}

const authenticationService = new AuthenticationService();
export default authenticationService;
