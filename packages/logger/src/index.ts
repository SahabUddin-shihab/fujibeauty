import winston from "winston";

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

export interface LoggerOptions {
  serviceName: string;
  level?: string;
  json?: boolean;
}

const consoleFormat = printf(({ level, message, timestamp: ts, serviceName, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  return `${ts} [${serviceName}] ${level}: ${stack || message}${metaStr}`;
});

/**
 * Creates a Winston logger scoped to a single microservice.
 * Emits structured JSON logs in production (for log aggregators like ELK/Loki)
 * and human-readable colorized logs in development.
 */
export function createLogger(options: LoggerOptions): winston.Logger {
  const { serviceName, level = process.env.LOG_LEVEL || "info" } = options;
  const isProduction = process.env.NODE_ENV === "production";

  return winston.createLogger({
    level,
    defaultMeta: { serviceName },
    format: combine(
      errors({ stack: true }),
      timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
      isProduction ? json() : combine(colorize(), consoleFormat)
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: `logs/${serviceName}-error.log`, level: "error" }),
      new winston.transports.File({ filename: `logs/${serviceName}-combined.log` })
    ],
    exceptionHandlers: [new winston.transports.Console()],
    rejectionHandlers: [new winston.transports.Console()]
  });
}

export type Logger = winston.Logger;
