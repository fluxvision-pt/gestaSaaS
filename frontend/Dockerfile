# frontend/Dockerfile
FROM node:22.12-alpine

WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
EXPOSE 80
CMD ["npm", "run", "preview", "--", "--port", "80", "--host"]
