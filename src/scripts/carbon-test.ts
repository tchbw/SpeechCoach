import assert from "assert";
import { argv } from "process";

import CarbonClient from "@/init/carbon";
import { logger } from "@/init/logger";

assert(argv[2], `Company id is required`);

const carbon = CarbonClient.withCompanyId(argv[2]);

// await carbon.files.upload({
//   file: fs.readFileSync(
//     `/Users/thomaschang/Projects/Degrom/ESA\ 1\ -\ EDR\ Report.pdf`
//   ),
// });
// const users = await carbon.users.list({});
const files = await carbon.files.queryUserFiles({});
logger.info(JSON.stringify(files.data));
