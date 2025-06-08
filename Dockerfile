# Etapa de build
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install --legacy-peer-deps && npm run build

# Etapa de produção
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

