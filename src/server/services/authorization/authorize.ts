import { logger } from "@/init/logger";
import { prisma } from "@/server/init/db";
import type { AuthenticationContext } from "@/server/services/authentication/context";
import type { Action, Resource } from "@/server/services/authorization/types";
import { ProjectAction } from "@/server/services/authorization/types";
import {
  CompanyAction,
  CompanyMemberAction,
  UserAction,
} from "@/server/services/authorization/types";
import { isSystemActor as _isSystemActor } from "@/server/services/authorization/util";
import { APIForbiddenError } from "@/server/util/errors";
import { assertUnreachable } from "@/server/util/types";

export async function authorize(
  ctx: AuthenticationContext | null,
  action: Action,
  resource: Resource
): Promise<true> {
  if (ctx === null) {
    throw new APIForbiddenError(
      `No actor found in context, anonymous users are not allowed to perform action "${action}"`
    );
  }

  const actor = ctx.getActor();

  const isSystemActor = _isSystemActor(actor);
  if (isSystemActor) {
    return true;
  }

  const resourceType = resource.type;

  switch (resourceType) {
    case `Company`:
      const companyMember = await prisma.companyMember.findUnique({
        where: {
          companyId_userId: {
            companyId: resource.id,
            userId: actor.id,
          },
        },
      });

      const isCompanyMember = !!companyMember;

      logger.info({ isCompanyMember, actorId: actor.id }, `Actor auth info`);
      switch (action as CompanyAction) {
        case CompanyAction.VIEW:
        case CompanyAction.UPLOAD_DOCUMENT:
        case CompanyAction.VIEW_PROJECT:
        case CompanyAction.CREATE_PROJECT:
        case CompanyAction.UPDATE_PROJECT:
          if (!isCompanyMember) {
            throw new APIForbiddenError(
              `User ${actor.id} is not a member of company ${resource.id}`
            );
          }
          return true;
      }
    case `User`:
      const actorIsTargetUser = actor.id === resource.id;
      switch (action as UserAction) {
        case UserAction.VIEW:
        case UserAction.VIEW_COMPANIES:
          if (!actorIsTargetUser) {
            throw new APIForbiddenError(
              `Only target user can perform action "${action}" on resource "${resourceType}"`
            );
          }
          return true;
      }
    case `Project`:
      const projectId = resource.id;
      const { companyId } = await prisma.project.findUniqueOrThrow({
        where: {
          id: projectId,
        },
      });
      const member = await prisma.companyMember.findUnique({
        where: {
          companyId_userId: {
            companyId,
            userId: actor.id,
          },
        },
      });
      const isUserMemberOfProjectOwner = !!member;

      switch (action as ProjectAction) {
        case ProjectAction.UPLOAD_DOCUMENT:
        case ProjectAction.VIEW_DOCUMENTS:
          if (!isUserMemberOfProjectOwner) {
            throw new APIForbiddenError(
              `Only user for project's company can perform action "${action}" on resource "${resourceType}"`
            );
          }
          return true;
      }
    case `CompanyMember`: {
      const targetCompanyMember = await prisma.companyMember.findUnique({
        where: {
          id: resource.id,
        },
      });

      let actorCompanyMember;
      if (targetCompanyMember) {
        actorCompanyMember = await prisma.companyMember.findUnique({
          where: {
            companyId_userId: {
              companyId: targetCompanyMember.companyId,
              userId: actor.id,
            },
          },
        });
      }

      const actorIsTargetMember = actor.id === targetCompanyMember?.userId;

      logger.info(
        {
          actor: actor.id,
          targetUserId: targetCompanyMember?.userId,
          actorIsTargetMember,
          actorCompanyMember,
        },
        `CompanyMember actor permission info`
      );

      switch (action as CompanyMemberAction) {
        case CompanyMemberAction.VIEW:
          if (!actorIsTargetMember) {
            throw new APIForbiddenError(
              `Only target company member can perform action "${action}" on resource "${resourceType}"`
            );
          }
          return true;
      }
    }
    default:
      assertUnreachable(resourceType, `Resource type not handled`);
  }
}
