# ================================
# 🏗️ Etapa 1: Build do Frontend
# ================================
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
RUN apk add --no-cache python3 make g++
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ================================
# ⚙️ Etapa 2: Build do Backend
# ================================
FROM node:18-alpine AS backend-build
WORKDIR /app/backend
RUN apk add --no-cache python3 make g++
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# ================================
# 🚀 Etapa 3: Produção
# ================================
FROM node:18-alpine AS production
WORKDIR /app

# Instala utilitário init seguro
RUN apk add --no-cache dumb-init

# Cria usuário não-root
RUN addgroup -S nodejs && adduser -S nestjs -G nodejs
USER nestjs

# Copia dependências do backend e instala apenas produção
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Copia o backend compilado
COPY --from=backend-build /app/backend/dist ./dist

# Copia o frontend buildado (Vite) para pasta pública
COPY --from=frontend-build /app/frontend/dist ./public

# Define variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3001
ENV APP_PORT=3001

# Expõe a porta correta
EXPOSE 3001

# Healthcheck local
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', res => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
