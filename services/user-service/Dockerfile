# syntax=docker/dockerfile:1

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY packages/logger/package.json packages/logger/package.json
COPY packages/kafka-client/package.json packages/kafka-client/package.json
COPY services/user-service/package.json services/user-service/package.json
RUN npm install --workspaces --if-present --include-workspace-root=false --no-audit --no-fund

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY packages ./packages
COPY services/user-service ./services/user-service
RUN npm run build --workspace=@ecommerce/logger \
 && npm run build --workspace=@ecommerce/kafka-client \
 && npm run build --workspace=user-service

FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/logger/dist ./packages/logger/dist
COPY --from=build /app/packages/logger/package.json ./packages/logger/package.json
COPY --from=build /app/packages/kafka-client/dist ./packages/kafka-client/dist
COPY --from=build /app/packages/kafka-client/package.json ./packages/kafka-client/package.json
COPY --from=build /app/services/user-service/dist ./services/user-service/dist
COPY --from=build /app/services/user-service/prisma ./services/user-service/prisma
COPY --from=build /app/services/user-service/package.json ./services/user-service/package.json

WORKDIR /app/services/user-service
RUN npx prisma generate

USER appuser

EXPOSE 4002

HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
  CMD node -e "require('http').get('http://localhost:4002/health',(r)=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
