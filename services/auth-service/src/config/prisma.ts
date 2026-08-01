import { PrismaClient } from "@prisma/client";
import { env } from "./env";

/**
 * Single shared Prisma client. In dev with hot-reload we stash it on
 * globalThis to avoid exhausting Postgres connections across reloads.
 */
declare global {
  // eslint-disable-next-line no-var
  var __authPrisma: PrismaClient | undefined;
}

export const prisma =
  global.__authPrisma ??
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

if (env.NODE_ENV !== "production") {
  global.__authPrisma = prisma;
}
