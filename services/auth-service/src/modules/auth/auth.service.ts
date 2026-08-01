import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { AuthRepository } from "./auth.repository";
import { TokenService, TokenPair } from "./token.service";
import { LoginDto, RegisterDto } from "./auth.dto";
import { ConflictError, ForbiddenError, UnauthorizedError } from "../../common/errors";
import { env } from "../../config/env";
import { eventProducer } from "../../config/kafka";
import { EventTopic } from "@ecommerce/kafka-client";
import { redis } from "../../config/redis";
import { createLogger } from "@ecommerce/logger";

const logger = createLogger({ serviceName: env.SERVICE_NAME });

const MAX_FAILED_LOGINS = 5;
const LOCKOUT_MINUTES = 15;

export interface RequestContext {
  userAgent?: string;
  ipAddress?: string;
}

export class AuthService {
  constructor(
    private readonly repository: AuthRepository = new AuthRepository(),
    private readonly tokens: TokenService = new TokenService()
  ) {}

  async register(dto: RegisterDto): Promise<{ userId: string; email: string }> {
    const existing = await this.repository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictError("An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(dto.password, env.BCRYPT_SALT_ROUNDS);
    const userId = randomUUID();

    const credential = await this.repository.create({
      userId,
      email: dto.email,
      passwordHash
    });

    // user-service owns the profile; it materializes its own row by
    // consuming this event, so auth-service never talks to user-service directly.
    await eventProducer.publish(
      EventTopic.UserRegistered,
      {
        userId: credential.userId,
        email: credential.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: credential.role
      },
      credential.userId
    );

    logger.info("User registered", { userId: credential.userId });

    return { userId: credential.userId, email: credential.email };
  }

  async login(dto: LoginDto, ctx: RequestContext): Promise<TokenPair & { userId: string; role: string }> {
    const credential = await this.repository.findByEmail(dto.email);
    if (!credential) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (credential.lockedUntil && credential.lockedUntil > new Date()) {
      throw new ForbiddenError(
        `Account temporarily locked due to repeated failed logins. Try again after ${credential.lockedUntil.toISOString()}`
      );
    }

    const passwordValid = await bcrypt.compare(dto.password, credential.passwordHash);
    if (!passwordValid) {
      const updated = await this.repository.incrementFailedLogins(credential.id);
      if (updated.failedLogins >= MAX_FAILED_LOGINS) {
        const lockUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60_000);
        await this.repository.lockAccount(credential.id, lockUntil);
      }
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!credential.isActive) {
      throw new ForbiddenError("Account is deactivated");
    }

    await this.repository.resetFailedLogins(credential.id);

    const accessToken = this.tokens.issueAccessToken({
      sub: credential.userId,
      email: credential.email,
      role: credential.role
    });

    const { token: refreshToken, hash, expiresAt } = this.tokens.generateRefreshToken();

    await this.repository.storeRefreshToken({
      credentialId: credential.id,
      tokenHash: hash,
      expiresAt,
      userAgent: ctx.userAgent,
      ipAddress: ctx.ipAddress
    });

    return {
      accessToken,
      refreshToken,
      refreshTokenExpiresAt: expiresAt,
      userId: credential.userId,
      role: credential.role
    };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const hash = this.tokens.hashRefreshToken(refreshToken);

    const isBlacklisted = await redis.get(`revoked-refresh:${hash}`);
    if (isBlacklisted) {
      throw new UnauthorizedError("Refresh token has been revoked");
    }

    const stored = await this.repository.findRefreshTokenByHash(hash);
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const credential = await this.repository.findById(stored.credentialId);
    if (!credential || !credential.isActive) {
      throw new UnauthorizedError("Account no longer active");
    }

    // Rotate: revoke the old refresh token and issue a brand new pair.
    // This limits the blast radius if a refresh token is ever stolen.
    await this.repository.revokeRefreshToken(hash);
    await redis.set(`revoked-refresh:${hash}`, "1", "EX", 60 * 60 * 24 * 8);

    const accessToken = this.tokens.issueAccessToken({
      sub: credential.userId,
      email: credential.email,
      role: credential.role
    });

    const { token: newRefreshToken, hash: newHash, expiresAt } = this.tokens.generateRefreshToken();
    await this.repository.storeRefreshToken({
      credentialId: credential.id,
      tokenHash: newHash,
      expiresAt
    });

    return { accessToken, refreshToken: newRefreshToken, refreshTokenExpiresAt: expiresAt };
  }

  async logout(refreshToken: string): Promise<void> {
    const hash = this.tokens.hashRefreshToken(refreshToken);
    await this.repository.revokeRefreshToken(hash);
    await redis.set(`revoked-refresh:${hash}`, "1", "EX", 60 * 60 * 24 * 8);
  }
}
