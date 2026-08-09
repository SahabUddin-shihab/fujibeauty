import { Router } from "express"
import proxy from "express-http-proxy";

const router= Router();

router.use('/auth',proxy("http://localhost:5001", {
    proxyReqPathResolver: (req)=> '/'
}));

router.use('/notification', proxy("http://localhost:5002", {
    proxyReqPathResolver: (req)=> '/'
}));


router.use('/order', proxy("http://localhost:5003",{
    proxyReqPathResolver: (req)=> '/'
}));

router.use('/order', proxy("http://localhost:5004",{
    proxyReqPathResolver: (req)=> '/'
}));

export default router;