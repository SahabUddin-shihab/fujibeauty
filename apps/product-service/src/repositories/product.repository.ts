import { prisma } from "../config/prisma";
import { Prisma, Product } from "../generated/prisma";

export interface ProductListFilters {
  page: number;
  limit: number;
  categoryId?: string;
  search?: string;
}

export class ProductRepository {
  async findMany(filters: ProductListFilters): Promise<{ products: Product[]; total: number }> {
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.search && {
        name: { contains: filters.search, mode: "insensitive" },
      }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: { createdAt: "desc" },
        include: { category: true },
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total };
  }

  findById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({ where: { id }, include: { category: true } });
  }

  findBySku(sku: string): Promise<Product | null> {
    return prisma.product.findUnique({ where: { sku } });
  }

  findBySlug(slug: string): Promise<Product | null> {
    return prisma.product.findUnique({ where: { slug } });
  }

  create(data: Prisma.ProductCreateInput): Promise<Product> {
    return prisma.product.create({ data });
  }

  updateById(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return prisma.product.update({ where: { id }, data });
  }

  // Soft delete: keep order history intact instead of a hard delete.
  softDeleteById(id: string): Promise<Product> {
    return prisma.product.update({ where: { id }, data: { isActive: false } });
  }

  decrementStock(id: string, quantity: number): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data: { stock: { decrement: quantity } },
    });
  }

  /**
   * Atomically decrements stock only if enough is available, using a
   * conditional WHERE so two concurrent requests can't both succeed and
   * push stock negative. Returns the number of rows updated (0 = failed).
   */
  async tryDecrementStock(id: string, quantity: number): Promise<number> {
    const result = await prisma.product.updateMany({
      where: { id, stock: { gte: quantity } },
      data: { stock: { decrement: quantity } },
    });
    return result.count;
  }

  async incrementStock(id: string, quantity: number): Promise<number> {
    const result = await prisma.product.updateMany({
      where: { id },
      data: { stock: { increment: quantity } },
    });
    return result.count;
  }
}
