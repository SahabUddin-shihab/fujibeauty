# FujiBeauty - Microservices Architecture Showcase

##  Project Overview

This repository demonstrates my expertise in **microservices architecture** and **Turborepo** monorepo management. It's a showcase project built to highlight my ability to design, develop, and orchestrate distributed systems with modern tooling and best practices.

While my company's main project is managed in a private repository, this demonstration portfolio reflects the same level of professional excellence and architectural thinking I bring to enterprise-level development.

##  Architecture Highlights

### Monorepo Structure with Turborepo
- **Modern Monorepo Management**: Leveraging Turborepo for efficient build orchestration and dependency management
- **Shared Codebase**: Reusable components and configurations across services
- **Type Safety**: Full TypeScript implementation across all services

### Docker Containerization
- **Production-Ready Dockerfiles**: Each service is containerized for consistency and portability
- **Docker Compose**: Seamless local development and testing environment
- **Multi-Stage Builds**: Optimized container sizes for production deployment


## How to Run the Project

### 1. Clone the Repository

```bash
git clone https://github.com/SahabUddin-shihab/fujibeauty.git
```

```bash
cd fujibeauty
```

### 2. Start Docker Services

Start the required infrastructure using Docker Compose:

```bash
docker compose up -d
```

### 3. Install Dependencies

Install all project dependencies from the root directory:

```bash
npm install
```

### 4. Start the Development Environment

Run all microservices in development mode:

```bash
npm run dev
```

After starting the project, the services will be available on:

| Service | URL |
|---|---|
| API Gateway | `http://localhost:4000` |
| Auth Service | `http://localhost:4001` |
| Product Service | `http://localhost:4002` |
| Order Service | `http://localhost:4003` |
| Payment Service | `http://localhost:4004` |

##  Services & Packages

### Applications
- **`Api-getway`** - Node.js(Typescript), express, Prisma, Postgress 
- **`Auth-service`** - Node.js(Typescript), express, Prisma, Postgress, Jwt
- **`Notification-service`** - Node.js(Typescript), express, Prisma, Postgress
- **`Product-service`** - Node.js(Typescript), express, Prisma, Postgress
- **`Order-service`** - Node.js(Typescript), express, Prisma, Postgress
- **`Payment-service`** - Node.js(Typescript), express, Prisma, Postgress

### Shared Packages
- **`@fujibeauty/config`** -(express)whole application configuration
- **`@fujibeauty/database`** -(express) Database configuration
- **`@fujibeauty/kafka`** -(express) Kafka configuration
- **`@fujibeauty/logger`** -(express) looger configuration
- **`@fujibeauty/shared-datatypes`** -(express) declared datatypes
- **`@fujibeauty/utils`** -(express) project global utils file

### Microservices Features
- **Independent Deployability**: Each service can be deployed separately
- **API Gateway Pattern**: Centralized routing and request handling
- **Service Discovery**: Inter-service communication via well-defined interfaces
- **Container**: Dockerized every services


##  Service Configuration

The API Gateway acts as the central entry point and routes requests to the appropriate microservices.

```env
API_GATEWAY_PORT=4000

AUTH_SERVICE_URL=http://localhost:4001
PRODUCT_SERVICE_URL=http://localhost:4002
ORDER_SERVICE_URL=http://localhost:4003
PAYMENT_SERVICE_URL=http://localhost:4004

```

##  Service Ports

| Service | Port | URL |
|---|---:|---|
| API Gateway | `4000` | `http://localhost:4000` |
| Auth Service | `4001` | `http://localhost:4001` |
| Product Service | `4002` | `http://localhost:4002` |
| Order Service | `4003` | `http://localhost:4003` |
| Payment Service | `4004` | `http://localhost:4004` |



##  Package.json Structure

```json
{
  "name": "fujibeauty",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "docker:up": "docker compose up -d",
    "docker:down": "docker compose down",
    "prisma:generate": "turbo run prisma:generate",
    "prisma:generate:all": "npm run prisma:generate -- --concurrency=1"
  },
  "devDependencies": {
    "@types/node": "^22.7.5",
    "turbo": "^2.1.3",
    "typescript": "^5.6.3"
  },
  "packageManager": "npm@10.8.2",
  "dependencies": {
    "stripe": "^22.5.0"
  }
}

