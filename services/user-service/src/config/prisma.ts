import { PrismaClient } from "@prisma/client";
import { env } from "./env";

declare global {
  // eslint-disable-next-line no-var
  var __userPrisma: PrismaClient | undefined;
}

export const prisma =
  global.__userPrisma ??
  new PrismaClient({ log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"] });

if (env.NODE_ENV !== "production") {
  global.__userPrisma = prisma;
}
