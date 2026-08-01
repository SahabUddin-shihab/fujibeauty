import jwt from "jsonwebtoken";
import { createHash, randomBytes } from "crypto";
import { env } from "../../config/env";
import { Role } from "@prisma/client";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

export interface AccessTokenClaims {
  sub: string;
  email: string;
  role: Role;
}

/**
 * Refresh tokens are opaque random strings, not JWTs: only their SHA-256 hash
 * is persisted, so a leaked database dump alone can't be replayed as a valid
 * session token. Access tokens remain short-lived signed JWTs for stateless
 * verification across every downstream microservice.
 */
export class TokenService {
  issueAccessToken(claims: AccessTokenClaims): string {
    return jwt.sign(claims, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN });
  }

  generateRefreshToken(): { token: string; hash: string; expiresAt: Date } {
    const token = randomBytes(48).toString("hex");
    const hash = this.hashRefreshToken(token);
    const expiresAt = new Date(Date.now() + this.parseExpiryMs(env.JWT_REFRESH_EXPIRES_IN));
    return { token, hash, expiresAt };
  }

  hashRefreshToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  private parseExpiryMs(expiry: string): number {
    const match = /^(\d+)([smhd])$/.exec(expiry);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7d
    const value = Number(match[1]);
    const unit = match[2];
    const unitMs: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
    return value * unitMs[unit];
  }
}
