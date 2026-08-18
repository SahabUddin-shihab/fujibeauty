import axios from "axios";
import { NotFoundError, AppError, ConflictError } from "@fujibeauty/utils";
import { env } from "../config/env";

export interface RemoteProduct {
  id: string;
  name: string;
  price: string;
  stock: number;
  isActive: boolean;
}

export async function getProductById(productId: string): Promise<RemoteProduct> {
  try {
    const response = await axios.get(`${env.PRODUCT_SERVICE_URL}/api/v1/products/${productId}`);
    return response.data.data as RemoteProduct;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new NotFoundError(`Product ${productId} not found`);
    }
    throw new AppError("Failed to reach product service", 502);
  }
}

const internalHeaders = { "x-internal-api-key": env.INTERNAL_API_KEY };

export async function reserveStock(productId: string, quantity: number): Promise<void> {
  try {
    await axios.post(
      `${env.PRODUCT_SERVICE_URL}/api/v1/products/${productId}/reserve-stock`,
      { quantity },
      { headers: internalHeaders }
    );
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      throw new ConflictError(error.response.data?.message ?? "Insufficient stock");
    }
    throw new AppError("Failed to reserve stock", 502);
  }
}

export async function releaseStock(productId: string, quantity: number): Promise<void> {
  await axios.post(
    `${env.PRODUCT_SERVICE_URL}/api/v1/products/${productId}/release-stock`,
    { quantity },
    { headers: internalHeaders }
  );
}
