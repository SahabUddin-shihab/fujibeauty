import { prisma } from "../../config/prisma";
import { CreateAddressDto, UpdateAddressDto, UpdateProfileDto } from "./users.dto";

export interface CreateUserInput {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
}

export class UsersRepository {
  findByUserId(userId: string) {
    return prisma.user.findFirst({
      where: { userId, deletedAt: null },
      include: { addresses: { where: { deletedAt: null } } }
    });
  }

  create(input: CreateUserInput) {
    return prisma.user.create({
      data: {
        userId: input.userId,
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        role: input.role ?? "CUSTOMER"
      }
    });
  }

  updateProfile(userId: string, data: UpdateProfileDto) {
    return prisma.user.update({ where: { userId }, data });
  }

  listAddresses(userId: string) {
    return prisma.address.findMany({ where: { userId, deletedAt: null }, orderBy: { createdAt: "desc" } });
  }

  async createAddress(userId: string, data: CreateAddressDto) {
    if (data.isDefault) {
      await prisma.address.updateMany({ where: { userId, deletedAt: null }, data: { isDefault: false } });
    }
    return prisma.address.create({ data: { ...data, userId } });
  }

  async updateAddress(userId: string, addressId: string, data: UpdateAddressDto) {
    if (data.isDefault) {
      await prisma.address.updateMany({ where: { userId, deletedAt: null }, data: { isDefault: false } });
    }
    return prisma.address.updateMany({ where: { id: addressId, userId, deletedAt: null }, data });
  }

  deleteAddress(userId: string, addressId: string) {
    return prisma.address.updateMany({
      where: { id: addressId, userId, deletedAt: null },
      data: { deletedAt: new Date() }
    });
  }

  findAddressById(userId: string, addressId: string) {
    return prisma.address.findFirst({ where: { id: addressId, userId, deletedAt: null } });
  }
}
