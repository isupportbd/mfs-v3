# ── Stage 1: Build ──────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules (e.g., node-gyp, python)
RUN apk add --no-cache python3 make g++

# Copy dependency specifications
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm install

# Copy full source code
COPY . .

# Build backend and frontend UI
RUN npm run build

# ── Stage 2: Production Runner ─────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install runtime dependencies
RUN apk add --no-cache curl

# Copy dependencies directly from builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy built outputs and runtime scripts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/src/framework/maker-cli ./src/framework/maker-cli
COPY --from=builder /app/src/database/migrations ./src/database/migrations

# Expose HTTP port
EXPOSE 3000

# Health check endpoint for Coolify
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start the application
CMD ["npm", "start"]
