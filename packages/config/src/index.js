"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commonEnvSchema = void 0;
exports.loadConfig = loadConfig;
const zod_1 = require("zod");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
function loadConfig(schema) {
    const result = schema.safeParse(process.env);
    if (!result.data) {
        console.error("Invalid environment configuration:");
        console.error(result.error?.flatten().fieldErrors);
        process.exit(1);
    }
    return result.data;
}
exports.commonEnvSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(["development", "production", "test"]).default("development"),
    REDIS_HOST: zod_1.z.string().default("localhost"),
    REDIS_PORT: zod_1.z.coerce.number().default(6379),
    KAFKA_BROKERS: zod_1.z.string().default("localhost:9092"),
    KAFKA_CLIENT_ID: zod_1.z.string().default("ecommerce-ai"),
});
//# sourceMappingURL=index.js.map