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

# Instala dependências básicas
RUN apk add --no-cache dumb-init

# Cria usuário seguro
RUN addgroup -S nodejs && adduser -S nestjs -G nodejs
USER nestjs

# Copia package.json e instala dependências de produção
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Copia o backend buildado
COPY --from=backend-build /app/backend/dist ./dist

# Copia o frontend buildado (Vite) para pasta pública
COPY --from=frontend-build /app/frontend/dist ./public

# Define variáveis
ENV NODE_ENV=production
ENV PORT=3000

# Exposição da porta
EXPOSE 3000

# Healthcheck interno (sem HTTPS)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', res => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Entrada padrão
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
