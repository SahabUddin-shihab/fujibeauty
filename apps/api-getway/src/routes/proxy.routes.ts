import { Router } from "express"
import proxy from "express-http-proxy";
import { ENV as env } from "@/config/env";

const router= Router();

router.use('/auth',proxy(env.AUTH_SERVICE_URL, {
    proxyReqPathResolver: (req)=> '/'
}));

router.use('/notification', proxy(env.NOTIFICATION_SERVICE_URL, {
    proxyReqPathResolver: (req)=> '/'
}));


router.use('/order', proxy(env.ORDER_SERVICE_URL,{
    proxyReqPathResolver: (req)=> '/'
}));

router.use('/payment', proxy(env.PAYMENT_SERVICE_URL,{
    proxyReqPathResolver: (req)=> '/'
}));

router.use('/product', proxy(env.PRODUCT_SERVICE_URL,{
    proxyReqPathResolver: (req)=> '/'
}));

export default router;