# Etapa 1 — Build do projeto
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etapa 2 — Servidor de produção
FROM node:20-alpine
WORKDIR /app

COPY --from=build /app/dist ./dist

RUN npm install -g http-server
RUN chmod -R 755 /app/dist

EXPOSE 80
ENV PORT=80

CMD ["sh", "-c", "while true; do http-server dist -p 80 --cors; sleep 2; done"]
