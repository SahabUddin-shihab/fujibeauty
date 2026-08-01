# AI-Powered E-Commerce Platform — Microservices Monorepo

## Status
Services implemented so far: **API Gateway**, **Auth Service**, **User Service**.
Remaining services (Product, Category, Inventory, Cart, Wishlist, Order, Payment,
Notification, Email, AI Recommendation, AI Search, Admin) are scaffolded in the
architecture (topics, gateway routes, docker-compose service names already reserved)
but not yet implemented — the gateway returns `503 SERVICE_UNAVAILABLE` for their
routes until they're built.

## Prerequisites
Only Node.js, Docker Desktop, and VS Code are assumed. Nothing else needs local install —
Postgres, Kafka, Redis all run in containers.

## Run everything
```bash
npm install
docker compose up -d --build
```

- API Gateway: http://localhost:3000
- Auth Service Swagger: http://localhost:4001/docs (also proxied via gateway)
- User Service Swagger: http://localhost:4002/docs
- Kafka UI: http://localhost:8090

## Try it
```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"Passw0rd1","firstName":"Jane","lastName":"Doe"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"Passw0rd1"}'

# Use the returned accessToken
curl http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer <accessToken>"
```

Registering publishes a `UserRegistered` Kafka event; user-service consumes it and
materializes the profile — so `/api/v1/users/me` will 404 for a few hundred ms
immediately after registration until the event is processed.

## Architecture notes
- Each service owns its own Postgres database (`auth_db`, `user_db`, ...), created
  automatically by `infra/postgres/init-multi-db.sh` on first boot.
- The API Gateway is the **only** service that verifies JWTs. It injects trusted
  `x-user-id` / `x-user-email` / `x-user-role` headers onto proxied requests;
  downstream services trust those headers rather than re-verifying tokens. This
  trust boundary depends on downstream services never being reachable directly
  from outside the Docker network in production (their ports are only exposed
  here for local development convenience).
- Cross-service communication for anything non-request/response goes through
  Kafka using the typed events in `packages/kafka-client/src/topics.ts`.
- Refresh tokens are opaque random strings; only their SHA-256 hash is stored,
  and they rotate on every use.

## Continuing the build
The remaining 12 services will be added in this same pattern: Prisma schema →
config → repository → service → controller → routes → Kafka handlers → Swagger →
Dockerfile → wired into docker-compose + gateway registry.
