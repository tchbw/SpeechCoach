import type { Project, User } from "@prisma/client";
import type { Company, CompanyMember } from "@prisma/client";

import type { AuthenticationContext } from "@/server/services/authentication/context";
import { authorize } from "@/server/services/authorization/authorize";
import type {
  CompanyAction,
  CompanyMemberAction,
  ProjectAction,
  UserAction,
} from "@/server/services/authorization/types";

export async function hasCompanyPerm(
  ctx: AuthenticationContext | null,
  actions: CompanyAction[],
  companyId: string | Company
) {
  await Promise.all(
    actions.map((act) =>
      authorize(ctx, act, {
        type: `Company`,
        id: typeof companyId === `string` ? companyId : companyId.id,
      })
    )
  );
}

export async function hasUserPerm(
  ctx: AuthenticationContext | null,
  actions: UserAction[],
  userId: string | User
) {
  await Promise.all(
    actions.map((act) =>
      authorize(ctx, act, {
        type: `User`,
        id: typeof userId === `string` ? userId : userId.id,
      })
    )
  );
}

export async function hasProjectPerm(
  ctx: AuthenticationContext | null,
  actions: ProjectAction[],
  projectId: string | Project
) {
  await Promise.all(
    actions.map((act) =>
      authorize(ctx, act, {
        type: `Project`,
        id: typeof projectId === `string` ? projectId : projectId.id,
      })
    )
  );
}

export async function hasCompanyMemberPerm(
  ctx: AuthenticationContext | null,
  actions: CompanyMemberAction[],
  companyMemberId: string | CompanyMember
) {
  await Promise.all(
    actions.map((act) =>
      authorize(ctx, act, {
        type: `CompanyMember`,
        id:
          typeof companyMemberId === `string`
            ? companyMemberId
            : companyMemberId.id,
      })
    )
  );
}
