import { Request, Response } from "express";
import { asyncHandler, sendSuccess } from "@fujibeauty/utils";
import { AuthService } from "../services/auth.service";

const authService = new AuthService();

export const register = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.register(req.body);
  sendSuccess(res, user, "User registered successfully", 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, tokens } = await authService.login(req.body);
  sendSuccess(res, { user, tokens }, "Login successful");
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const tokens = await authService.refresh(req.body.refreshToken);
  sendSuccess(res, tokens, "Token refreshed successfully");
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await authService.logout(req.body.refreshToken);
  sendSuccess(res, null, "Logged out successfully");
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, req.user, "Profile fetched successfully");
});
