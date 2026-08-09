import winston from "winston";

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, service, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `[${timestamp}] [${service ?? "app"}] ${level}: ${stack ?? message}${metaStr}`;
  })
);

const prodFormat = combine(timestamp(), errors({ stack: true }), json());

export function createLogger(serviceName: string) {
  return winston.createLogger({
    level: process.env.LOG_LEVEL ?? "info",
    defaultMeta: { service: serviceName },
    format: process.env.NODE_ENV === "production" ? prodFormat : devFormat,
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({
        filename: `logs/${serviceName}-error.log`,
        level: "error",
      }),
      new winston.transports.File({
        filename: `logs/${serviceName}-combined.log`,
      }),
    ],
  });
}

export type Logger = ReturnType<typeof createLogger>;
