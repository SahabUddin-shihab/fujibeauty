import { Request, Response } from "express";
import { UsersService } from "./users.service";

export class UsersController {
  constructor(private readonly service: UsersService = new UsersService()) {}

  getMyProfile = async (req: Request, res: Response): Promise<void> => {
    const profile = await this.service.getProfile(req.identity!.userId);
    res.status(200).json({ data: profile });
  };

  updateMyProfile = async (req: Request, res: Response): Promise<void> => {
    const profile = await this.service.updateProfile(req.identity!.userId, req.body);
    res.status(200).json({ data: profile });
  };

  listAddresses = async (req: Request, res: Response): Promise<void> => {
    const addresses = await this.service.listAddresses(req.identity!.userId);
    res.status(200).json({ data: addresses });
  };

  createAddress = async (req: Request, res: Response): Promise<void> => {
    const address = await this.service.createAddress(req.identity!.userId, req.body);
    res.status(201).json({ data: address });
  };

  updateAddress = async (req: Request, res: Response): Promise<void> => {
    const address = await this.service.updateAddress(req.identity!.userId, req.params.id, req.body);
    res.status(200).json({ data: address });
  };

  deleteAddress = async (req: Request, res: Response): Promise<void> => {
    await this.service.deleteAddress(req.identity!.userId, req.params.id);
    res.status(204).send();
  };
}
