FROM node:20-alpine AS base
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm install
RUN npx prisma generate

COPY . .
RUN npm run build

EXPOSE 4002
CMD ["node", "dist/server.js"]
