import { z } from "zod";

import { logger } from "@/init/logger";
import type { RetoolApiRouteParams } from "@/pages/api/retool/_util";
import { RetoolApiRoute } from "@/pages/api/retool/_util";
import { prisma } from "@/server/init/db";

class Route extends RetoolApiRoute {
  async POST({ req, res }: RetoolApiRouteParams): Promise<void> {
    const { name, slug } = z
      .object({
        name: z.string(),
        slug: z.string(),
      })
      .parse(req.body);

    const company = await prisma.company.create({
      data: {
        publicName: name,
        slug,
      },
    });

    logger.info({ company }, `Created new company via retool`);
    res.status(200).send({});
  }
}

export default Route.initHandler();
