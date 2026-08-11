import { logger } from '../config/logger';
export function requestLogger(req, _res, next) {
    logger.info(`${req.method} ${req.originalUrl}`);
    next();
}
//# sourceMappingURL=request-logger.middleware.js.map