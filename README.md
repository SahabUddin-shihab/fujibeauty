# FujiBeauty - Microservices Architecture Showcase

## 🎯 Project Overview

This repository demonstrates my expertise in **microservices architecture** and **Turborepo** monorepo management. It's a showcase project built to highlight my ability to design, develop, and orchestrate distributed systems with modern tooling and best practices.

While my company's main project is managed in a private repository, this demonstration portfolio reflects the same level of professional excellence and architectural thinking I bring to enterprise-level development.

## 🏗️ Architecture Highlights

### Monorepo Structure with Turborepo
- **Modern Monorepo Management**: Leveraging Turborepo for efficient build orchestration and dependency management
- **Shared Codebase**: Reusable components and configurations across services
- **Type Safety**: Full TypeScript implementation across all services

### Docker Containerization
- **Production-Ready Dockerfiles**: Each service is containerized for consistency and portability
- **Docker Compose**: Seamless local development and testing environment
- **Multi-Stage Builds**: Optimized container sizes for production deployment

## 📦 Services & Packages

### Applications
- **`docs`** - Next.js documentation/API showcase app
- **`web`** - Main Next.js web application

### Shared Packages
- **`@repo/ui`** - Reusable React component library
- **`@repo/eslint-config`** - Shared ESLint configurations (includes eslint-config-next and eslint-config-prettier)
- **`@repo/typescript-config`** - Shared TypeScript configurations

### Microservices Features
- **Independent Deployability**: Each service can be deployed separately
- **API Gateway Pattern**: Centralized routing and request handling
- **Service Discovery**: Inter-service communication via well-defined interfaces
- **Container Orchestration**: Docker-based deployment ready for Kubernetes

## 📦 Package.json Structure

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