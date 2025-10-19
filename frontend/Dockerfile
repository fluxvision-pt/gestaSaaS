# Etapa 2 — Servidor de produção
FROM node:20-alpine
WORKDIR /app

COPY --from=build /app/dist ./dist

# Instalar servidor estático leve
RUN npm install -g serve
RUN chmod -R 755 /app/dist

EXPOSE 80
ENV PORT=80

# Executar em modo SPA (corrige 404 nas rotas)
CMD ["serve", "-s", "dist", "-l", "80", "--no-clipboard", "--single"]
