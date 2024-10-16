import { Prisma } from "@prisma/client";
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import superjson from "superjson";

superjson.registerCustom<Prisma.Decimal, string>(
  {
    isApplicable: (v): v is Prisma.Decimal => Prisma.Decimal.isDecimal(v),
    serialize: (v) => v.toJSON(),
    deserialize: (v) => new Prisma.Decimal(v),
  },
  `Prisma.Decimal`
);

export default superjson;
