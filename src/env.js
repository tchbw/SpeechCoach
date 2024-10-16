import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum([`development`, `test`, `production`])
      .default(`development`),
    POSTMARK_API_TOKEN: z.string(),
    SMTP_FROM: z.string(),
    PRISMA_LOG_LEVEL: z.string().optional(),
    PRISMA_FIELD_ENCRYPTION_KEY: z.string(),
    OPENAI_API_KEY: z.string(),
    BART_API_KEY: z.string(),
    AWS_S3_ACCESS_KEY_ID: z.string(),
    AWS_S3_SECRET_ACCESS_KEY: z.string(),
    AWS_S3_BUCKET: z.string(),
    RAGIE_API_KEY: z.string(),
    CARBON_API_KEY: z.string(),
    TEMPORAL_ADDRESS: z.string(),
    TEMPORAL_CLIENT_KEY:
      process.env.NODE_ENV === `production`
        ? z.string()
        : z.string().optional(),
    TEMPORAL_CLIENT_CERT:
      process.env.NODE_ENV === `production`
        ? z.string()
        : z.string().optional(),
    TEMPORAL_NAMESPACE: z.string(),
    TEMPORAL_QUEUE: z.string(),
    AWS_REGION: z.string(),
    REDUCTO_API_KEY: z.string(),
    RETOOL_API_SECRET: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
    NEXT_PUBLIC_APP_NAME: z.string(),
    NEXT_PUBLIC_APP_URL: z.string(),
    NEXT_PUBLIC_NODE_ENV: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_NODE_ENV: process.env.NODE_ENV,
    POSTMARK_API_TOKEN: process.env.POSTMARK_API_TOKEN,
    SMTP_FROM: process.env.SMTP_FROM,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    PRISMA_LOG_LEVEL: process.env.PRISMA_LOG_LEVEL,
    PRISMA_FIELD_ENCRYPTION_KEY: process.env.PRISMA_FIELD_ENCRYPTION_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    BART_API_KEY: process.env.BART_API_KEY,
    AWS_S3_ACCESS_KEY_ID: process.env.AWS_S3_ACCESS_KEY_ID,
    AWS_S3_SECRET_ACCESS_KEY: process.env.AWS_S3_SECRET_ACCESS_KEY,
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
    RAGIE_API_KEY: process.env.RAGIE_API_KEY,
    CARBON_API_KEY: process.env.CARBON_API_KEY,
    TEMPORAL_ADDRESS: process.env.TEMPORAL_ADDRESS,
    TEMPORAL_CLIENT_KEY: process.env.TEMPORAL_CLIENT_KEY,
    TEMPORAL_CLIENT_CERT: process.env.TEMPORAL_CLIENT_CERT,
    TEMPORAL_NAMESPACE: process.env.TEMPORAL_NAMESPACE,
    TEMPORAL_QUEUE: process.env.TEMPORAL_QUEUE,
    AWS_REGION: process.env.AWS_REGION,
    REDUCTO_API_KEY: process.env.REDUCTO_API_KEY,
    RETOOL_API_SECRET: process.env.RETOOL_API_SECRET,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
