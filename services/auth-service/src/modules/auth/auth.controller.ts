import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { LoginDto, RefreshDto, RegisterDto } from "./auth.dto";

export class AuthController {
  constructor(private readonly service: AuthService = new AuthService()) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.register(req.body as RegisterDto);
    res.status(201).json({ data: result });
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.login(req.body as LoginDto, {
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip
    });
    res.status(200).json({
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        refreshTokenExpiresAt: result.refreshTokenExpiresAt,
        userId: result.userId,
        role: result.role
      }
    });
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body as RefreshDto;
    const result = await this.service.refresh(refreshToken);
    res.status(200).json({ data: result });
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body as RefreshDto;
    await this.service.logout(refreshToken);
    res.status(204).send();
  };

  me = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({ data: req.user });
  };
}
