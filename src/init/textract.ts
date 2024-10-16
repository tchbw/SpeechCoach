import { TextractClient } from "@aws-sdk/client-textract";

import { env } from "@/env";

export const textractClient = new TextractClient({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.DEGROM_AWS_ACCESS_KEY_ID,
    secretAccessKey: env.DEGROM_AWS_SECRET_ACCESS_KEY,
  },
});
