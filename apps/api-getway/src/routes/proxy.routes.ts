import { Router } from "express";
import  proxy  from "express-http-proxy";
import { env } from "../config/env";

const router = Router();

router.use(
  "/auth",
  proxy(env.AUTH_SERVICE_URL, {
    proxyReqPathResolver: (req) => `/api/v1/auth${req.url}`,
  })
);

router.use(
  "/products",
  proxy(env.PRODUCT_SERVICE_URL, {
    proxyReqPathResolver: (req) => `/api/v1/products${req.url}`,
  })
);

router.use(
  "/categories",
  proxy(env.PRODUCT_SERVICE_URL, {
    proxyReqPathResolver: (req) => `/api/v1/categories${req.url}`,
  })
);

router.use(
  "/orders",
  proxy(env.ORDER_SERVICE_URL, {
    proxyReqPathResolver: (req) => `/api/v1/orders${req.url}`,
  })
);

router.use(
  "/payments",
  proxy(env.PAYMENT_SERVICE_URL, {
    proxyReqPathResolver: (req) => `/api/v1/payments${req.url}`,
  })
);

export default router;
