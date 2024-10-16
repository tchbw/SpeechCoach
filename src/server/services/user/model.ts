import type { Prisma } from "@prisma/client";

import { prisma } from "@/server/init/db";

export const userModelDefaultInclude = {
  Companies: {
    include: {
      company: true,
    },
  },
};

export type UserWithDefaults = Prisma.UserGetPayload<{
  include: typeof userModelDefaultInclude;
}>;

class UsersModel {
  async byId(id: string) {
    return await prisma.user.findUnique({
      where: {
        id,
      },
      include: userModelDefaultInclude,
    });
  }

  async all() {
    return await prisma.user.findMany({
      include: userModelDefaultInclude,
    });
  }
}

const usersModel = new UsersModel();
export { usersModel };
