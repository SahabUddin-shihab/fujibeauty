import { prisma } from "../config/prisma";
import { EmailDeliveryStatus } from "../generated/prisma";

export class EmailLogRepository {
  
  create(to: string, subject: string, template: string, status: EmailDeliveryStatus, error?: string) {
    return prisma.emailLog.create({ data: { to, subject, template, status, error } });
  }

  findRecentByRecipient(to: string, take = 20) {
    return prisma.emailLog.findMany({
      where: { to },
      orderBy: { createdAt: "desc" },
      take,
    });
  }
}
