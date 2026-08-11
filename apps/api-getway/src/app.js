import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { globalRateLimit } from './middleware/rate-limit.middleware';
import { requestLogger } from './middleware/request-logger.middleware';
import router from './routes/proxy.routes';
export function createApp() {
    const app = express();
    app.use(cors());
    app.use(helmet());
    app.use(globalRateLimit);
    app.use(requestLogger);
    app.use('/health', (_req, res) => {
        res.status(200).json({
            status: "ok",
            service: "api-getway"
        });
    });
    app.use("/api/v1", router);
    app.use((req, res) => {
        res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` });
    });
    return app;
}
//# sourceMappingURL=app.js.map