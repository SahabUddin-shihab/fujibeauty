import { Credential, Role } from "@prisma/client";
import { prisma } from "../../config/prisma";

export interface CreateCredentialInput {
  userId: string;
  email: string;
  passwordHash: string;
  role?: Role;
}

export class AuthRepository {
  findByEmail(email: string): Promise<Credential | null> {
    return prisma.credential.findFirst({ where: { email, deletedAt: null } });
  }

  findById(id: string): Promise<Credential | null> {
    return prisma.credential.findFirst({ where: { id, deletedAt: null } });
  }

  create(input: CreateCredentialInput): Promise<Credential> {
    return prisma.credential.create({
      data: {
        userId: input.userId,
        email: input.email,
        passwordHash: input.passwordHash,
        role: input.role ?? Role.CUSTOMER
      }
    });
  }

  incrementFailedLogins(id: string): Promise<Credential> {
    return prisma.credential.update({
      where: { id },
      data: { failedLogins: { increment: 1 } }
    });
  }

  resetFailedLogins(id: string): Promise<Credential> {
    return prisma.credential.update({
      where: { id },
      data: { failedLogins: 0, lockedUntil: null }
    });
  }

  lockAccount(id: string, until: Date): Promise<Credential> {
    return prisma.credential.update({ where: { id }, data: { lockedUntil: until } });
  }

  storeRefreshToken(params: {
    credentialId: string;
    tokenHash: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }) {
    return prisma.refreshToken.create({
      data: {
        credentialId: params.credentialId,
        tokenHash: params.tokenHash,
        expiresAt: params.expiresAt,
        userAgent: params.userAgent,
        ipAddress: params.ipAddress
      }
    });
  }

  findRefreshTokenByHash(tokenHash: string) {
    return prisma.refreshToken.findUnique({ where: { tokenHash } });
  }

  revokeRefreshToken(tokenHash: string) {
    return prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() }
    });
  }

  revokeAllRefreshTokensForCredential(credentialId: string) {
    return prisma.refreshToken.updateMany({
      where: { credentialId, revokedAt: null },
      data: { revokedAt: new Date() }
    });
  }
}
