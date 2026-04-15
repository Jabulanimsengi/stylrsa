# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with reduced memory usage
RUN npm ci --maxsockets 1 --legacy-peer-deps

# Install sharp for Alpine/musl (cross-platform image optimization fix)
RUN npm install --os=linux --libc=musl --cpu=x64 sharp

# Copy source code
COPY . .

# Build arguments for Next.js public variables (must be present at build time)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
ARG NEXT_PUBLIC_CLOUDINARY_API_KEY
ARG NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ARG NEXT_PUBLIC_SENTRY_DSN


# Build with memory limit for low-RAM VMs
ENV NODE_OPTIONS="--max-old-space-size=1024"
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

# Default port (can be overridden)
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
EXPOSE 8080

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:8080/ || exit 1

CMD ["sh", "-c", "SERVER_JS=$(find /app -maxdepth 4 -name server.js ! -path '*/node_modules/*' | head -n 1); if [ -n \"$SERVER_JS\" ]; then exec node \"$SERVER_JS\"; else echo 'Standalone server.js not found'; find /app -maxdepth 4 -name server.js; exit 1; fi"]
