# Usa Node 20 para buildar o projeto
FROM node:20-alpine AS build
WORKDIR /app

# Copia os arquivos
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Servidor leve com Node
FROM node:20-alpine
WORKDIR /app

# Copia o resultado do build
COPY --from=build /app/dist ./dist

# Instala o servidor HTTP para servir os arquivos
RUN npm install -g serve

# Expõe a porta 80
EXPOSE 80

# Comando de início
CMD ["serve", "-s", "dist", "-l", "80"]
