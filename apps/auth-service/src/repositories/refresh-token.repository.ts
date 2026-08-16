import { prisma } from "../config/prisma";
import { Prisma, RefreshToken } from "@/generated/prisma";

export class RefreshTokenRepository {
  
  create(userId: string, token: string, expiresAt: Date): Promise<RefreshToken> {
    return prisma.refreshToken.create({ data: { userId, token, expiresAt } });
  }

  findByToken(token: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findUnique({ where: { token } });
  }

  revoke(token: string): Promise<RefreshToken> {
    return prisma.refreshToken.update({ where: { token }, data: { revoked: true } });
  }

  revokeAllForUser(userId: string): Promise<Prisma.BatchPayload> {
    return prisma.refreshToken.updateMany({ where: { userId }, data: { revoked: true } });
  }
}
