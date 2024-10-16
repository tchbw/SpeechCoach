import type { RetoolApiRouteParams } from "@/pages/api/retool/_util";
import { RetoolApiRoute } from "@/pages/api/retool/_util";
import { prisma } from "@/server/init/db";

class Route extends RetoolApiRoute {
  async GET({ res }: RetoolApiRouteParams): Promise<void> {
    const companies = await prisma.company.findMany();

    res.status(200).json(companies);
  }
}

export default Route.initHandler();
