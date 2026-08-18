import slugify from "slugify";
import { ConflictError, ForbiddenError, NotFoundError } from "@fujibeauty/utils";
import { ProductRepository, ProductListFilters } from "../repositories/product.repository";
import { CategoryRepository } from "../repositories/category.repository";
import { ProductEventsProducer } from "../producers/product-events.producer";
import { CreateProductInput, UpdateProductInput } from "../validators/product.validator";
import { redis, PRODUCT_CACHE_TTL_SECONDS } from "../config/redis";
import { logger } from "../config/logger";
import { AuthenticatedUser } from "@fujibeauty/shared-types";

const productRepository = new ProductRepository();
const categoryRepository = new CategoryRepository();
const productEventsProducer = new ProductEventsProducer();

export class ProductService {
  async create(input: CreateProductInput, vendor: AuthenticatedUser) {
    const category = await categoryRepository.findById(input.categoryId);
    if (!category) {
      throw new NotFoundError("Category not found");
    }

    const existingSku = await productRepository.findBySku(input.sku);
    if (existingSku) {
      throw new ConflictError("A product with this SKU already exists");
    }

    const slug = slugify(input.name, { lower: true, strict: true });

    const product = await productRepository.create({
      name: input.name,
      slug,
      description: input.description,
      price: input.price,
      stock: input.stock,
      sku: input.sku,
      images: input.images,
      vendorId: vendor.id,
      category: { connect: { id: input.categoryId } },
    });

    logger.info("Product created", { productId: product.id, vendorId: vendor.id });

    await productEventsProducer.publishProductCreated({
      productId: product.id,
      name: product.name,
      price: product.price.toString(),
      categoryId: product.categoryId,
      vendorId: product.vendorId,
      createdAt: product.createdAt.toISOString(),
    });

    await this.invalidateListCache();

    return product;
  }

  async list(filters: ProductListFilters) {
    const cacheKey = `products:list:${JSON.stringify(filters)}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const result = await productRepository.findMany(filters);
    await redis.setex(cacheKey, PRODUCT_CACHE_TTL_SECONDS, JSON.stringify(result));

    return result;
  }

  async getById(id: string) {
    const product = await productRepository.findById(id);
    if (!product || !product.isActive) {
      throw new NotFoundError("Product not found");
    }
    return product;
  }

  async update(id: string, input: UpdateProductInput, requester: AuthenticatedUser) {
    const product = await this.assertOwnership(id, requester);

    if (input.categoryId) {
      const category = await categoryRepository.findById(input.categoryId);
      if (!category) {
        throw new NotFoundError("Category not found");
      }
    }

    const updated = await productRepository.updateById(product.id, { ...input });
    await this.invalidateListCache();

    return updated;
  }

  async delete(id: string, requester: AuthenticatedUser) {
    const product = await this.assertOwnership(id, requester);
    await productRepository.softDeleteById(product.id);
    await this.invalidateListCache();
  }

  // Called by order-service (via the internal API key) when placing an order.
  // Atomic + conditional so concurrent orders can't oversell the same product.
  async reserveStock(id: string, quantity: number) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    const updatedRows = await productRepository.tryDecrementStock(id, quantity);
    if (updatedRows === 0) {
      throw new ConflictError(`Insufficient stock for product ${product.name}`);
    }

    await this.invalidateListCache();
  }

  // Compensating action: called by order-service if an order fails partway
  // through reserving multiple products, to undo the reservations already made.
  async releaseStock(id: string, quantity: number) {
    await productRepository.incrementStock(id, quantity);
    await this.invalidateListCache();
  }

  private async assertOwnership(id: string, requester: AuthenticatedUser) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    if (requester.role !== "ADMIN" && product.vendorId !== requester.id) {
      throw new ForbiddenError("You do not have permission to modify this product");
    }

    return product;
  }

  private async invalidateListCache() {
    const keys = await redis.keys("products:list:*");
    if (keys.length) {
      await redis.del(...keys);
    }
  }
}
