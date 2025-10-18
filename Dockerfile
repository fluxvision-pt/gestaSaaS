# Multi-stage build para aplicação SaaS Gesta
# Etapa 1: Build do Frontend (React/Vite)
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

# Copia arquivos de dependências do frontend
COPY frontend/package*.json ./
RUN npm ci --only=production

# Copia código fonte do frontend
COPY frontend/ ./

# Build do frontend para produção
RUN npm run build

# Etapa 2: Build do Backend (NestJS)
FROM node:18-alpine AS backend-build

WORKDIR /app/backend

# Copia arquivos de dependências do backend
COPY backend/package*.json ./
RUN npm ci --only=production

# Copia código fonte do backend
COPY backend/ ./

# Build do backend para produção
RUN npm run build

# Etapa 3: Imagem final de produção
FROM node:18-alpine AS production

WORKDIR /app

# Instala apenas dependências de produção do backend
COPY backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copia o backend buildado
COPY --from=backend-build /app/backend/dist ./dist
COPY --from=backend-build /app/backend/node_modules ./node_modules

# Copia o frontend buildado para ser servido pelo backend
COPY --from=frontend-build /app/frontend/dist ./public

# Copia arquivos de configuração necessários
COPY backend/.env.example ./.env

# Cria usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
USER nestjs

# Expõe a porta da aplicação
EXPOSE 3000

# Define variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000

# Comando para iniciar a aplicação
CMD ["node", "dist/main"]