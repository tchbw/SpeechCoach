import type { Prisma } from "@prisma/client";
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { PrismaClient as _PrismaClient } from "@prisma/client";
import { fieldEncryptionExtension } from "prisma-field-encryption";

import { env } from "@/env.js";
import { logger } from "@/init/logger";

function _prismaLogLevel(): Prisma.LogLevel[] {
  let log: Prisma.LogLevel[] = [`error`];
  if (env.NODE_ENV === `development`) {
    log = [`query`, `error`, `warn`];
  }

  const envLogLevel = env.PRISMA_LOG_LEVEL;
  if (envLogLevel) {
    try {
      log = envLogLevel.split(`,`).filter(Boolean) as Prisma.LogLevel[];
    } catch (error) {
      logger.error({ envLogLevel }, `Invalid PRISMA_LOG_LEVEL: ${envLogLevel}`);
      throw error;
    }
  }
  logger.info({ logLevel: log }, `Using PRISMA_LOG_LEVEL: ${log.join(`,`)}`);
  return log;
}

const createExtendedPrismaClient = () => {
  const _prisma = new _PrismaClient({
    log: _prismaLogLevel(),
  });

  // This is where we would add extensions
  // https://www.prisma.io/docs/concepts/components/prisma-client/client-extensions
  return _prisma.$extends(
    // https://github.com/47ng/prisma-field-encryption/
    fieldEncryptionExtension({
      encryptionKey: env.PRISMA_FIELD_ENCRYPTION_KEY,
    })
  );
};

// export type PrismaClient = ReturnType<typeof createExtendedPrismaClient>;
export type PrismaClient = ReturnType<typeof createExtendedPrismaClient>;
export type PrismaTransactionClient = Parameters<
  Parameters<PrismaClient[`$transaction`]>[0]
>[0];

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createExtendedPrismaClient>;
};

// Cache prisma clients in non-production environments
// https://github.com/prisma/prisma/issues/1983#issuecomment-620621213
let prisma: PrismaClient;

if (env.NODE_ENV === `production`) {
  prisma = createExtendedPrismaClient();
} else {
  if (globalForPrisma.prisma) {
    prisma = globalForPrisma.prisma;
  } else {
    prisma = createExtendedPrismaClient();
    globalForPrisma.prisma = prisma;
  }
}

export { prisma };
