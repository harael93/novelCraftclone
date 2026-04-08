# Use official Node.js image as build environment
FROM node:20 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Use Nginx for production server
FROM nginx:1.25-alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*


# Copy built app from previous stage to root for root deployment
COPY --from=build /app/dist/ /usr/share/nginx/html/

# Copy custom nginx config
COPY docker/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
