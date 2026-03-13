# Use Node.js 22 as the base
FROM node:22-bookworm-slim AS base
WORKDIR /app

# Install dependencies (unzip is needed for bun)
RUN apt-get update && apt-get install -y openssl libssl3 curl unzip && \
    curl -fsSL https://bun.sh/install | bash && \
    rm -rf /var/lib/apt/lists/*

ENV PATH="/root/.bun/bin:${PATH}"

# Install dependencies using Bun (fastest)
FROM base AS deps
COPY package.json bun.lock* ./
COPY prisma ./prisma/
RUN bun install --frozen-lockfile

# Generate Prisma Client
RUN bun run db:generate

# Build the application
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build using Node instead of Bun to avoid SIGILL (Illegal Instruction) on older CPUs
RUN npm run build

# Production image
FROM node:22-bookworm-slim AS runner
WORKDIR /app

# Install curl for health check and openssl for prisma
RUN apt-get update && apt-get install -y openssl libssl3 curl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 --gid nodejs --create-home nextjs
ENV HOME=/home/nextjs

# Copy built files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy entrypoint script
COPY docker-entrypoint.sh /app/
RUN chmod +x /app/docker-entrypoint.sh && chown nextjs:nodejs /app/docker-entrypoint.sh

# Create db directory
RUN mkdir -p /app/db && chown -R nextjs:nodejs /app/db

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:${PORT:-3000}/api/health || exit 1

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "server.js"]
