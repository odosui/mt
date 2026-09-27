# Multi-stage build for mt application

# Stage 1: Build client
FROM node:24-alpine AS client-builder
ARG GIT_COMMIT=""
ENV GIT_COMMIT=$GIT_COMMIT
WORKDIR /app
# Copy config.json for vite.config.ts
COPY config.json tsconfig.base.json package*.json ./
RUN npm ci
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Build server
FROM node:24-alpine AS server-builder
WORKDIR /app
COPY tsconfig.base.json package*.json ./
RUN npm ci
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# Stage 3: Server runtime dependencies (no devDependencies)
FROM node:24-alpine AS server-deps
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev

# Stage 4: Production image
FROM node:24-alpine
RUN apk add --no-cache git su-exec
WORKDIR /app

# Copy server dependencies and built code
COPY --from=server-builder /app/server/package*.json ./server/
COPY --from=server-builder /app/server/dist ./server/dist
COPY --from=server-deps /app/server/node_modules ./server/node_modules

# Copy built client files to server's expected location
COPY --from=client-builder /app/client/dist ./client/dist

# Set environment variables
ENV NODE_ENV=production
ENV MT_PORT=3042
ENV MT_HOST=0.0.0.0
ENV MT_HOME=/data/mt

# Expose the port
EXPOSE 3042

# Create mt directory
RUN mkdir -p /data/mt/notes && chown -R node:node /data/mt

# Start the server as an unprivileged user (see the entrypoint)
COPY scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
WORKDIR /app/server
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]
