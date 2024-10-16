import { Client, ScheduleNotFoundError } from "@temporalio/client";
import { Worker } from "@temporalio/worker";
import { dirname } from "path";
import { fileURLToPath } from "url";

import { env } from "@/env";
import { logger } from "@/init/logger";
import * as activities from "@/temporal/activities";
import { schedules } from "@/temporal/schedules";
import { getClientConnection, getWorkerConnection } from "@/temporal/util";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Sync schedules with Temporal server
 *
 * This iterates over `schedules` and creates or updates each schedule based on the code.
 * If a schedule is not in `schedules`, it is deleted.
 */
async function syncSchedules() {
  const connection = await getClientConnection();

  const client = new Client({ connection, namespace: env.TEMPORAL_NAMESPACE });

  for (const schedule of schedules) {
    const { scheduleId } = schedule;
    const handle = client.schedule.getHandle(scheduleId);
    try {
      // update the existing existing schedule
      await handle.update((prev) => ({
        ...prev,
        ...schedule,
      }));
      logger.info({ scheduleId }, `Synced schedule`);
    } catch (err) {
      if (err instanceof ScheduleNotFoundError) {
        // create a new schedule
        logger.info({ scheduleId }, `Creating schedule`);
        await client.schedule.create(schedule);
        logger.info({ scheduleId }, `Created schedule`);
      }
    }
  }

  // delete schedules that no longer exist in code
  const targetScheduleIds = schedules.map((s) => s.scheduleId);
  for await (const { scheduleId } of client.schedule.list()) {
    if (!targetScheduleIds.includes(scheduleId)) {
      logger.info({ scheduleId }, `Deleting schedule`);
      await client.schedule.getHandle(scheduleId).delete();
      logger.info({ scheduleId }, `Deleted schedule`);
    }
  }

  await client.connection.close();
}

/**
 * Run the Temporal worker
 */
async function runWorker() {
  const connection = await getWorkerConnection();

  try {
    const worker = await Worker.create({
      connection,
      namespace: env.TEMPORAL_NAMESPACE,
      workflowsPath: `${__dirname}/workflows.ts`,
      activities,
      taskQueue: env.TEMPORAL_QUEUE,
      //   interceptors: {
      //     activity: [
      //       (ctx) => ({
      //         inbound: new SentryInterceptor(ctx),
      //       }),
      //     ],
      //   },
    });

    await worker.run();
  } finally {
    await connection.close();
  }
}

async function run() {
  await syncSchedules();
  await runWorker();
}

// eslint-disable-next-line promise/prefer-await-to-callbacks
run().catch((err: Error) => {
  logger.error({ err }, `Temporal worker failed to start`);
  process.exit(1);
});
