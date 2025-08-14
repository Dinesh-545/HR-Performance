# Use the official Node.js image as the base image
FROM node:18-alpine AS base
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the source code
COPY . .

# Build the application
RUN npm run build

# Use nginx to serve the built application
FROM nginx:alpine AS final
COPY --from=base /app/dist/hr-performance-web/browser /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 