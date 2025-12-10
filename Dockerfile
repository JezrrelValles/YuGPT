# Etapa 1: Build
FROM node:22.19.0-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:stable-alpine AS final

# Copiar archivos compilados al directorio público de nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar nginx.conf personalizado
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer puerto 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
