import { logger } from "@/init/logger";
import { prisma } from "@/server/init/db";
import authenticationService from "@/server/services/authentication/service";

// Upsert Degrom company
const company = await prisma.company.upsert({
  where: { slug: `raquel` },
  update: {},
  create: {
    publicName: `Raquel`,
    slug: `raquel`,
  },
});

// Upsert user Thomas
const user = await prisma.user.upsert({
  where: { email: `ariasraquelmaria@gmail.com` },
  update: {},
  create: {
    name: `Raquel`,
    email: `ariasraquelmaria@gmail.com`,
  },
});
// const user2 = await prisma.user.upsert({
//   where: { email: `chris.cheng.8866@gmail.com` },
//   update: {},
//   create: {
//     name: `Chris`,
//     email: `chris.cheng.8866@gmail.com`,
//   },
// });

// Upsert CompanyMember
await prisma.companyMember.upsert({
  where: {
    companyId_userId: {
      companyId: company.id,
      userId: user.id,
    },
  },
  update: {},
  create: {
    companyId: company.id,
    userId: user.id,
  },
});
// await prisma.companyMember.upsert({
//   where: {
//     companyId_userId: {
//       companyId: company.id,
//       userId: user2.id,
//     },
//   },
//   update: {},
//   create: {
//     companyId: company.id,
//     userId: user2.id,
//   },
// });

const code = await authenticationService.generateMagicLink({
  email: `ariasraquelmaria@gmail.com`,
});

await authenticationService.setUserPassword({
  email: `ariasraquelmaria@gmail.com`,
  password: `degrom48`,
});

// await authenticationService.setUserPassword({
//   email: `chris.cheng.8866@gmail.com`,
//   password: `password`,
// });

logger.info(code);
