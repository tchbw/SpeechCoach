import { prisma } from "@/server/init/db";
import { hasUserPerm } from "@/server/services/authorization/service";
import { UserAction } from "@/server/services/authorization/types";
import { BaseService } from "@/server/services/BaseService";

export class UserService extends BaseService {
  async getUser(userId: string) {
    await hasUserPerm(this.ctx, [UserAction.VIEW], userId);
    return prisma.user.findUniqueOrThrow({ where: { id: userId } });
  }

  async getCompanies({ userId }: { userId: string }) {
    await hasUserPerm(this.ctx, [UserAction.VIEW_COMPANIES], userId);

    return prisma.company.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
    });
  }
}
