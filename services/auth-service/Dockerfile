# syntax=docker/dockerfile:1

# ---- deps ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY packages/logger/package.json packages/logger/package.json
COPY packages/kafka-client/package.json packages/kafka-client/package.json
COPY services/auth-service/package.json services/auth-service/package.json
RUN npm install --workspaces --if-present --include-workspace-root=false --no-audit --no-fund

# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY packages ./packages
COPY services/auth-service ./services/auth-service
RUN npm run build --workspace=@ecommerce/logger \
 && npm run build --workspace=@ecommerce/kafka-client \
 && npm run build --workspace=auth-service

# ---- runtime ----
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/logger/dist ./packages/logger/dist
COPY --from=build /app/packages/logger/package.json ./packages/logger/package.json
COPY --from=build /app/packages/kafka-client/dist ./packages/kafka-client/dist
COPY --from=build /app/packages/kafka-client/package.json ./packages/kafka-client/package.json
COPY --from=build /app/services/auth-service/dist ./services/auth-service/dist
COPY --from=build /app/services/auth-service/prisma ./services/auth-service/prisma
COPY --from=build /app/services/auth-service/package.json ./services/auth-service/package.json

WORKDIR /app/services/auth-service
RUN npx prisma generate

USER appuser

EXPOSE 4001

HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
  CMD node -e "require('http').get('http://localhost:4001/health',(r)=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
