# Etapa 1 — Build do projeto
FROM node:20-alpine AS build
WORKDIR /app

# Copia dependências
COPY package*.json ./
RUN npm ci

# Copia o código fonte
COPY . .

# Gera o build do frontend
RUN npm run build

# Etapa 2 — Servidor de produção
FROM node:20-alpine
WORKDIR /app

# Copia os arquivos gerados
COPY --from=build /app/dist ./dist

# Instala servidor estático
RUN npm install -g serve

# Define porta
EXPOSE 80

# Inicia o servidor
CMD ["serve", "-s", "dist", "-l", "80"]
