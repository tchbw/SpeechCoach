import { ServerClient } from "postmark";

import { env } from "@/env.js";

export const postmark = new ServerClient(env.POSTMARK_API_TOKEN);
