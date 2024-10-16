import type { RetoolApiRouteParams } from "@/pages/api/retool/_util";
import { RetoolApiRoute } from "@/pages/api/retool/_util";
import { companyMembersModel } from "@/server/services/companyMember/model";

class Route extends RetoolApiRoute {
  async GET({ res }: RetoolApiRouteParams): Promise<void> {
    const companyMembers = await companyMembersModel.all();

    res.status(200).json(companyMembers);
  }
}

export default Route.initHandler();
