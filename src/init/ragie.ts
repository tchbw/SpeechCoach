import { Ragie } from "ragie";

import { env } from "@/env";

const ragie = new Ragie({
  auth: env.RAGIE_API_KEY,
});

export default ragie;
