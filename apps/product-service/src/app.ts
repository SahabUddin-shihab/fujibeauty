import express, {Application} from 'express';
import cors from 'cors';
import helmet from 'helmet';

export function createApp(): Application {

    const app= express();
    app.use(cors());
    app.use(helmet());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use('/',(req,res)=>{
        res.json('Response from product-service');
    });

    return app;
}