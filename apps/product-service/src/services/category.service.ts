import slugify from "slugify";
import { ConflictError } from "@fujibeauty/utils";
import { CategoryRepository } from "../repositories/category.repository";

const categoryRepository = new CategoryRepository();

export class CategoryService {
  async create(name: string) {
    const slug = slugify(name, { lower: true, strict: true });

    const existing = await categoryRepository.findBySlug(slug);
    if (existing) {
      throw new ConflictError("A category with this name already exists");
    }

    return categoryRepository.create(name, slug);
  }

  list() {
    return categoryRepository.findAll();
  }
}
