import { prisma } from "../config/prisma";
import { Category } from "../generated/prisma";

export class CategoryRepository {
  findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({ where: { id } });
  }

  findBySlug(slug: string): Promise<Category | null> {
    return prisma.category.findUnique({ where: { slug } });
  }

  findAll(): Promise<Category[]> {
    return prisma.category.findMany({ orderBy: { name: "asc" } });
  }

  create(name: string, slug: string): Promise<Category> {
    return prisma.category.create({ data: { name, slug } });
  }
}
