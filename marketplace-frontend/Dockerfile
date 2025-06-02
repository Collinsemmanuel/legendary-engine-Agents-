# Stage 1: Build the React app
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
# Using package*.json to copy both package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:1.25-alpine

# Copy built static files from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom Nginx configuration
# This file needs to be in the same directory as the Dockerfile (marketplace-frontend/)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for Nginx
EXPOSE 80

# Start Nginx
# The default Nginx CMD is ["nginx", "-g", "daemon off;"] which is what we want.
# So, explicitly stating it is optional but good for clarity.
CMD ["nginx", "-g", "daemon off;"]
