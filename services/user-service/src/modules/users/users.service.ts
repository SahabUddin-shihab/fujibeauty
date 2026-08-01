import { UsersRepository } from "./users.repository";
import { CreateAddressDto, UpdateAddressDto, UpdateProfileDto } from "./users.dto";
import { NotFoundError } from "../../common/errors";

export class UsersService {
  constructor(private readonly repository: UsersRepository = new UsersRepository()) {}

  async getProfile(userId: string) {
    const user = await this.repository.findByUserId(userId);
    if (!user) throw new NotFoundError("User profile not found");
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const existing = await this.repository.findByUserId(userId);
    if (!existing) throw new NotFoundError("User profile not found");
    return this.repository.updateProfile(userId, dto);
  }

  listAddresses(userId: string) {
    return this.repository.listAddresses(userId);
  }

  createAddress(userId: string, dto: CreateAddressDto) {
    return this.repository.createAddress(userId, dto);
  }

  async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto) {
    const existing = await this.repository.findAddressById(userId, addressId);
    if (!existing) throw new NotFoundError("Address not found");
    await this.repository.updateAddress(userId, addressId, dto);
    return this.repository.findAddressById(userId, addressId);
  }

  async deleteAddress(userId: string, addressId: string) {
    const existing = await this.repository.findAddressById(userId, addressId);
    if (!existing) throw new NotFoundError("Address not found");
    await this.repository.deleteAddress(userId, addressId);
  }
}
