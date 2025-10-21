# Etapa 1 - Build
FROM node:20-alpine AS build

WORKDIR /app

# Instalar dependências do sistema necessárias
RUN apk add --no-cache python3 make g++

# Copiar apenas os arquivos essenciais
COPY package*.json ./
RUN npm ci

# Copiar o código fonte do backend
COPY . .

# Gerar build de produção
RUN npm run build

# Etapa 2 - Produção
FROM node:20-alpine AS production

WORKDIR /app

# Instalar dependências necessárias em produção
RUN apk add --no-cache dumb-init curl

# Copiar apenas os arquivos necessários do build anterior
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

# Instalar dependências de produção
RUN npm ci --only=production

# Expor porta padrão do NestJS
EXPOSE 3000

# Variável de ambiente padrão
ENV NODE_ENV=production

# Comando de inicialização
CMD ["dumb-init", "node", "dist/main.js"]