# Build Stage
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Pass build-time environment variables for Vite static replacements
ARG VITE_NODE_URL
ARG VITE_FASTAPI_URL
ENV VITE_NODE_URL=$VITE_NODE_URL
ENV VITE_FASTAPI_URL=$VITE_FASTAPI_URL

RUN npm run build

# Serve Stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Expose Nginx default listening port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
