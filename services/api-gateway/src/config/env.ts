import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  SERVICE_NAME: z.string().default("api-gateway"),

  REDIS_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),

  AUTH_SERVICE_URL: z.string().url(),
  USER_SERVICE_URL: z.string().url().optional(),
  PRODUCT_SERVICE_URL: z.string().url().optional(),
  CATEGORY_SERVICE_URL: z.string().url().optional(),
  INVENTORY_SERVICE_URL: z.string().url().optional(),
  CART_SERVICE_URL: z.string().url().optional(),
  WISHLIST_SERVICE_URL: z.string().url().optional(),
  ORDER_SERVICE_URL: z.string().url().optional(),
  PAYMENT_SERVICE_URL: z.string().url().optional(),
  NOTIFICATION_SERVICE_URL: z.string().url().optional(),
  EMAIL_SERVICE_URL: z.string().url().optional(),
  AI_RECOMMENDATION_SERVICE_URL: z.string().url().optional(),
  AI_SEARCH_SERVICE_URL: z.string().url().optional(),
  ADMIN_SERVICE_URL: z.string().url().optional(),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().default(120),

  LOG_LEVEL: z.string().default("info")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

/**
 * Registry of every downstream service the gateway can proxy to.
 * Services that aren't deployed yet simply have `undefined` here and are
 * skipped when routes are mounted, so the gateway degrades gracefully
 * as new microservices come online.
 */
export const serviceRegistry: Record<string, string | undefined> = {
  auth: env.AUTH_SERVICE_URL,
  users: env.USER_SERVICE_URL,
  products: env.PRODUCT_SERVICE_URL,
  categories: env.CATEGORY_SERVICE_URL,
  inventory: env.INVENTORY_SERVICE_URL,
  cart: env.CART_SERVICE_URL,
  wishlist: env.WISHLIST_SERVICE_URL,
  orders: env.ORDER_SERVICE_URL,
  payments: env.PAYMENT_SERVICE_URL,
  notifications: env.NOTIFICATION_SERVICE_URL,
  emails: env.EMAIL_SERVICE_URL,
  recommendations: env.AI_RECOMMENDATION_SERVICE_URL,
  search: env.AI_SEARCH_SERVICE_URL,
  admin: env.ADMIN_SERVICE_URL
};

/** Routes reachable without a valid access token. */
export const PUBLIC_ROUTES: RegExp[] = [
  /^\/api\/v1\/auth\/register$/,
  /^\/api\/v1\/auth\/login$/,
  /^\/api\/v1\/auth\/refresh$/,
  /^\/api\/v1\/products(\/.*)?$/, // browsing the catalog doesn't require login
  /^\/api\/v1\/categories(\/.*)?$/,
  /^\/api\/v1\/search(\/.*)?$/,
  /^\/health$/,
  /^\/docs(\/.*)?$/
];
