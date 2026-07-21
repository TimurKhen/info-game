# Stage 1: Build the Angular application
FROM node:alpine AS build

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the Angular app for production
RUN npm run build -- --configuration=production

# Stage 2: Serve the application using Nginx
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the built Angular app from the build stage
# (Note: Angular 17+ defaults to dist/<project-name>/browser. Adjust if needed)
COPY --from=build /app/dist/vibe-ton/browser /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
