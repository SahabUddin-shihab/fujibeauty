import express, {Application} from 'express';
import cors from 'cors';
import helmet from 'helmet';

export function createApp(): Application {

    const app= express();
    app.use(cors());
    app.use(helmet());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use('/health',(_req,res)=>{
        res.status(200).json({
            status: "OK",
            service: "Notification Service"
        })
    });

    app.use((req, res) => {
        res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` });
    });

    return app;
}