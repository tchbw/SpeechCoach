import type { RetoolApiRouteParams } from "@/pages/api/retool/_util";
import { RetoolApiRoute } from "@/pages/api/retool/_util";
import { usersModel } from "@/server/services/user/model";

class Route extends RetoolApiRoute {
  async GET({ res }: RetoolApiRouteParams): Promise<void> {
    const users = await usersModel.all();

    res.status(200).json(users);
  }
}

export default Route.initHandler();
