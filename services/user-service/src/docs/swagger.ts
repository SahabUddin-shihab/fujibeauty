import swaggerJsdoc from "swagger-jsdoc";
import { env } from "../config/env";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "User Service API",
      version: "1.0.0",
      description: "User profiles and saved addresses. Materialized from auth-service via Kafka."
    },
    servers: [{ url: `http://localhost:${env.PORT}` }]
  },
  apis: ["./src/modules/**/*.routes.ts", "./dist/modules/**/*.routes.js"]
});
