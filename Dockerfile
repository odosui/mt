# Multi-stage build for mt application

# Stage 1: Build client
FROM node:20-alpine AS client-builder
WORKDIR /app
# Copy config.json for vite.config.ts
COPY config.json ./
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Build server
FROM node:20-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./
RUN npm run build

# Stage 3: Production image
FROM node:20-alpine
RUN apk add --no-cache git
WORKDIR /app

# Copy server dependencies and built code
COPY --from=server-builder /app/server/package*.json ./server/
COPY --from=server-builder /app/server/dist ./server/dist
COPY --from=server-builder /app/server/node_modules ./server/node_modules

# Copy built client files to server's expected location
COPY --from=client-builder /app/client/dist ./client/dist

# Set environment variables
ENV NODE_ENV=production
ENV MT_PORT=3042
ENV MT_HOME=/data/mt

# Expose the port
EXPOSE 3042

# Create mt directory
RUN mkdir -p /data/mt/notes

# Start the server
WORKDIR /app/server
CMD ["node", "dist/index.js"]
