# Multi-stage build for coding interview platform
# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy frontend package files
COPY package*.json ./
COPY vite.config.js ./
COPY index.html ./
COPY eslint.config.js ./

# Install frontend dependencies
RUN npm ci --only=production

# Copy frontend source
COPY src ./src
COPY public ./public

# Build frontend
RUN npm run build

# Stage 2: Build backend and final image
FROM node:20-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy backend package files
COPY server/package*.json ./server/

# Install backend dependencies
WORKDIR /app/server
RUN npm ci --only=production

# Copy backend source
COPY server/src ./src

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/dist /app/server/public

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the server
CMD ["node", "src/index.js"]
