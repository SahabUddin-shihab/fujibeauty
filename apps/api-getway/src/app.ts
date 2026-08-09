import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { globalRateLimit } from './middleware/rate-limit.middleware';

export function createApp():Application {

    const app= express();
    app.use(cors());
    app.use(helmet());
    app.use(globalRateLimit);

    return app;
}
