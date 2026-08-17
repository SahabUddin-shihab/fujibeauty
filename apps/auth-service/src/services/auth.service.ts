import bcrypt from "bcrypt";
import { ConflictError, UnauthorizedError } from "@fujibeauty/utils";
import { UserRepository } from "../repositories/user.repository";
import { RefreshTokenRepository } from "../repositories/refresh-token.repository";
import { UserEventsProducer } from "../producers/user-events.producer";
import { generateAccessToken, generateRefreshToken, getRefreshTokenExpiry } from "../utils/token.util";
import { env } from "../config/env";
import { RegisterInput, LoginInput } from "../validators/auth.validator";
import { logger } from "../config/logger";

const userRepository = new UserRepository();
const refreshTokenRepository = new RefreshTokenRepository();
const userEventsProducer = new UserEventsProducer();

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {

  async register(input: RegisterInput) {

    const existingUser = await userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictError("An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);

    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    logger.info("New user registered", { userId: user.id, email: user.email });

    await userEventsProducer.publishUserRegistered({
      userId: user.id,
      email: user.email,
      name: user.name,
      registeredAt: user.createdAt.toISOString(),
    });

    return this.toPublicUser(user);
  }

  async login(input: LoginInput): Promise<{ user: ReturnType<AuthService["toPublicUser"]>; tokens: AuthTokens }> {
    const user = await userRepository.findByEmail(input.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const tokens = await this.issueTokens(user.id, user.email, user.role);

    await userEventsProducer.publishUserLoggedIn({
      userId: user.id,
      email: user.email,
      loggedInAt: new Date().toISOString(),
    });

    return { user: this.toPublicUser(user), tokens };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const storedToken = await refreshTokenRepository.findByToken(refreshToken);

    if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const user = await userRepository.findById(storedToken.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError("User not found or inactive");
    }

    // Rotate refresh token: revoke the old one and issue a new pair.
    await refreshTokenRepository.revoke(refreshToken);

    return this.issueTokens(user.id, user.email, user.role);
  }

  async logout(refreshToken: string): Promise<void> {
    const storedToken = await refreshTokenRepository.findByToken(refreshToken);
    if (storedToken && !storedToken.revoked) {
      await refreshTokenRepository.revoke(refreshToken);
    }
  }

  private async issueTokens(userId: string, email: string, role: string): Promise<AuthTokens> 
  {
    const accessToken = generateAccessToken({ sub: userId, email, role });
    const refreshToken = generateRefreshToken();

    await refreshTokenRepository.create(userId, refreshToken, getRefreshTokenExpiry());

    return { accessToken, refreshToken };
  }

  private toPublicUser(user: { id: string; name: string; email: string; role: string; createdAt: Date }) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
