"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogger = createLogger;
const winston_1 = __importDefault(require("winston"));
const { combine, timestamp, printf, colorize, errors, json } = winston_1.default.format;
const devFormat = combine(colorize(), timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), errors({ stack: true }), printf(({ level, message, timestamp, service, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `[${timestamp}] [${service ?? "app"}] ${level}: ${stack ?? message}${metaStr}`;
}));
const prodFormat = combine(timestamp(), errors({ stack: true }), json());
function createLogger(serviceName) {
    return winston_1.default.createLogger({
        level: process.env.LOG_LEVEL ?? "info",
        defaultMeta: { service: serviceName },
        format: process.env.NODE_ENV === "production" ? prodFormat : devFormat,
        transports: [
            new winston_1.default.transports.Console(),
            new winston_1.default.transports.File({
                filename: `logs/${serviceName}-error.log`,
                level: "error",
            }),
            new winston_1.default.transports.File({
                filename: `logs/${serviceName}-combined.log`,
            }),
        ],
    });
}
//# sourceMappingURL=index.js.map