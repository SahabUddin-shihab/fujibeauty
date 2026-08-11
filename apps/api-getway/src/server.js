import { createApp } from "./app";
import { ENV as env } from "./config/env";
;
import { logger } from "./config/logger";
const app = createApp();
const server = app.listen(env.API_GATEWAY_PORT, () => {
    logger.info(`API Gateway listening on port ${env.API_GATEWAY_PORT}`);
});
const shutdown = (signal) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    server.close(() => {
        logger.info("Shutdown complete");
        process.exit(0);
    });
};
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
//# sourceMappingURL=server.js.map