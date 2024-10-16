import type {
  Workflow,
  WorkflowHandleWithFirstExecutionRunId,
  WorkflowStartOptions,
} from "@temporalio/client";
import { Connection, WorkflowClient } from "@temporalio/client";
import { NativeConnection } from "@temporalio/worker";

import { env } from "@/env";

export async function getWorkerConnection() {
  const connection = await NativeConnection.connect({
    address: env.TEMPORAL_ADDRESS,
    tls:
      env.TEMPORAL_CLIENT_CERT && env.TEMPORAL_CLIENT_KEY
        ? {
            clientCertPair: {
              crt: Buffer.from(env.TEMPORAL_CLIENT_CERT),
              key: Buffer.from(env.TEMPORAL_CLIENT_KEY),
            },
          }
        : undefined,
  });
  return connection;
}

export async function getClientConnection() {
  const connection = await Connection.connect({
    address: env.TEMPORAL_ADDRESS,
    tls:
      env.TEMPORAL_CLIENT_CERT && env.TEMPORAL_CLIENT_KEY
        ? {
            clientCertPair: {
              crt: Buffer.from(env.TEMPORAL_CLIENT_CERT),
              key: Buffer.from(env.TEMPORAL_CLIENT_KEY),
            },
          }
        : undefined,
  });
  return connection;
}

export async function runTemporalWorkflow<T extends Workflow>(
  workflowTypeOrFunc: string | T,
  options: WorkflowStartOptions<T>
): Promise<WorkflowHandleWithFirstExecutionRunId<T>> {
  const client = await getTemporalWorkflowClient();

  return await client.start(workflowTypeOrFunc, options);
}

export async function getTemporalWorkflowClient(): Promise<WorkflowClient> {
  const connection = await getClientConnection();
  return new WorkflowClient({
    connection,
    namespace: env.TEMPORAL_NAMESPACE,
  });
}
