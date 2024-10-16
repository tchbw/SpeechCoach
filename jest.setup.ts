/* eslint-disable no-console */
import { loadEnvConfig } from "@next/env";
import assert from "assert";
import { execSync } from "child_process";
import { Client } from "pg";

import { logger } from "@/init/logger";

// load environment variables using the same logic as Next.js
loadEnvConfig(process.cwd());

// Set up a test database schema for integration tests
if (/\.(int|wrkr)\.ts/.test(JEST_TEST_PATH)) {
  assert(process.env.NODE_ENV === `test`, `NODE_ENV must be "test"`);
  assert(process.env.DATABASE_URL, `DATABASE_URL must be set`);

  const dbUrl = `${process.env.DATABASE_URL}?schema=${JEST_TEST_ID}`;

  process.env.DATABASE_URL = dbUrl;
  // process.env.CLAYBOARD_ENV_ID = JEST_TEST_ID;

  beforeAll(() => {
    // before running any tests, set up the test database schema
    runMigrationsOnSchema(dbUrl);
  });

  afterAll(async () => {
    // after all tests, drop the test database schema
    await dropDatabaseSchema(JEST_TEST_ID);
  });
}

function runMigrationsOnSchema(connectionString: string) {
  logger.info(`Running migrations on schema ${JEST_TEST_ID}`);

  // run migrations
  execSync(
    `PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK=true DATABASE_URL=${connectionString} DIRECT_DATABASE_URL=${connectionString} ./node_modules/.bin/prisma migrate deploy`
  );
}

async function dropDatabaseSchema(schema: string) {
  await withDbClient((client) =>
    client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`)
  );
}

async function withDbClient<T>(fn: (client: Client) => Promise<T>) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  try {
    await client.connect();
    return await fn(client);
  } finally {
    await client.end();
  }
}
