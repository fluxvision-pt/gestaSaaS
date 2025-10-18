# Multi-stage build para aplicação SaaS Gesta
# Etapa 1: Build do Frontend (React/Vite)
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

# Instala dependências necessárias para o build
RUN apk add --no-cache python3 make g++

# Copia arquivos de dependências do frontend
COPY frontend/package*.json ./
RUN npm ci

# Copia código fonte do frontend
COPY frontend/ ./

# Build do frontend para produção
RUN npm run build

# Etapa 2: Build do Backend (NestJS)
FROM node:18-alpine AS backend-build

WORKDIR /app/backend

# Instala dependências necessárias para o build
RUN apk add --no-cache python3 make g++

# Copia arquivos de dependências do backend
COPY backend/package*.json ./
RUN npm ci

# Copia código fonte do backend
COPY backend/ ./

# Build do backend para produção
RUN npm run build

# Etapa 3: Imagem final de produção
FROM node:18-alpine AS production

WORKDIR /app

# Instala dependências de sistema necessárias
RUN apk add --no-cache dumb-init

# Cria usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

# Copia e instala apenas dependências de produção do backend
COPY backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copia o backend buildado
COPY --from=backend-build /app/backend/dist ./dist

# Copia o frontend buildado para ser servido pelo backend
COPY --from=frontend-build /app/frontend/dist ./public

# Muda ownership dos arquivos para o usuário não-root
RUN chown -R nestjs:nodejs /app

# Muda para usuário não-root
USER nestjs

# Expõe a porta da aplicação
EXPOSE 3000

# Define variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/v1/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Comando para iniciar a aplicação usando dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]