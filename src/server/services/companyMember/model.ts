import type { Prisma } from "@prisma/client";

import { prisma } from "@/server/init/db";

export const companyMemberModelDefaultInclude = {
  user: true,
  company: true,
};

export type CompanyMemberWithDefaults = Prisma.CompanyMemberGetPayload<{
  include: typeof companyMemberModelDefaultInclude;
}>;

class CompanyMembersModel {
  async byId(id: string) {
    return await prisma.companyMember.findUnique({
      where: {
        id,
      },
      include: companyMemberModelDefaultInclude,
    });
  }

  async all() {
    return await prisma.companyMember.findMany({
      include: companyMemberModelDefaultInclude,
    });
  }
}

const companyMembersModel = new CompanyMembersModel();
export { companyMembersModel };
