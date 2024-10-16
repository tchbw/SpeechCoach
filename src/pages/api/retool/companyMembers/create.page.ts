import { z } from "zod";

import type { RetoolApiRouteParams } from "@/pages/api/retool/_util";
import { RetoolApiRoute } from "@/pages/api/retool/_util";
import { prisma } from "@/server/init/db";
import authenticationService from "@/server/services/authentication/service";

class Route extends RetoolApiRoute {
  async POST({ req, res }: RetoolApiRouteParams): Promise<void> {
    const { userName, userEmail, userPassword, companyId } = z
      .object({
        userName: z.string(),
        userEmail: z.string().email(),
        userPassword: z.string(),
        companyId: z.string(),
      })
      .parse(JSON.parse(req.body as unknown as string));

    // Upsert user
    const user = await prisma.user.upsert({
      where: { email: userEmail },
      update: { name: userName },
      create: {
        name: userName,
        email: userEmail,
      },
    });

    // Upsert CompanyMember
    await prisma.companyMember.upsert({
      where: {
        companyId_userId: {
          companyId: companyId,
          userId: user.id,
        },
      },
      update: {},
      create: {
        companyId: companyId,
        userId: user.id,
      },
    });

    // Set user password
    await authenticationService.setUserPassword({
      email: userEmail,
      password: userPassword,
    });

    res
      .status(200)
      .json({ message: `User created and added to company successfully` });
  }
}

export default Route.initHandler();
