# =========================================
# Multi-stage build para aplicação FluxVision
# =========================================

# Etapa 1: Build do Frontend (React/Vite)
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend
RUN apk add --no-cache python3 make g++

# Copia e instala dependências
COPY ./frontend/package*.json ./
RUN npm ci

# Copia código fonte e gera build
COPY ./frontend/ ./
RUN npm run build


# Etapa 2: Build do Backend (NestJS)
FROM node:20-alpine AS backend-build

WORKDIR /app/backend
RUN apk add --no-cache python3 make g++

COPY ./backend/package*.json ./
RUN npm ci
COPY ./backend/ ./
RUN npm run build


# Etapa 3: Produção final
FROM node:20-alpine AS production

WORKDIR /app
RUN apk add --no-cache dumb-init curl

# Usuário seguro
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

# Dependências de produção do backend
COPY ./backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copia builds
COPY --from=backend-build /app/backend/dist ./dist
COPY --from=frontend-build /app/frontend/dist ./public

RUN chown -R nestjs:nodejs /app

ENV NODE_ENV=production
ENV PORT=3001
ENV APP_PORT=3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=5 \
  CMD curl -fs http://localhost:3001/api/health || exit 1

USER nestjs
EXPOSE 3001
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]
