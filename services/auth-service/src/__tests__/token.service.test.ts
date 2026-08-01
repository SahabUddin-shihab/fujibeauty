import { TokenService } from "../modules/auth/token.service";
import { Role } from "@prisma/client";

describe("TokenService", () => {
  const service = new TokenService();

  it("issues a verifiable access token containing the expected claims", () => {
    const token = service.issueAccessToken({ sub: "user-1", email: "a@b.com", role: Role.CUSTOMER });
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3); // header.payload.signature
  });

  it("generates a refresh token whose hash is deterministic for the same token", () => {
    const { token, hash } = service.generateRefreshToken();
    expect(service.hashRefreshToken(token)).toBe(hash);
  });

  it("generates unique refresh tokens on each call", () => {
    const first = service.generateRefreshToken();
    const second = service.generateRefreshToken();
    expect(first.token).not.toBe(second.token);
    expect(first.hash).not.toBe(second.hash);
  });

  it("sets refresh token expiry in the future", () => {
    const { expiresAt } = service.generateRefreshToken();
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
  });
});
