import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';

export function createApp():Application {

    const app= express();
    app.use(cors());
    app.use(helmet());

    return app;
}
