# Etapa 1 — Build do projeto
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Etapa 2 — Servidor de produção
FROM node:20-alpine AS production
WORKDIR /app

# Copia o build gerado da etapa anterior
COPY --from=build /app/dist ./dist

# Instala servidor estático leve
RUN npm install -g serve
RUN chmod -R 755 /app/dist

EXPOSE 80
ENV PORT=80

# Corrige rotas SPA (evita 404 em /login, /dashboard etc)
CMD ["serve", "-s", "dist", "-l", "80", "--no-clipboard", "--single"]
