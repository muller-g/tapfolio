# =============================================================================
# TapFolio — Frontend (Next.js 14)
# Multi-stage build: desenvolvimento e produção
# =============================================================================

# -----------------------------------------------------------------------------
# Stage base
# -----------------------------------------------------------------------------
FROM node:22-alpine AS base

RUN apk add --no-cache curl
WORKDIR /app

# -----------------------------------------------------------------------------
# Stage development
# -----------------------------------------------------------------------------
FROM base AS development

COPY package.json package-lock.json* ./
RUN npm ci

EXPOSE 3000
CMD ["npm", "run", "dev"]

# -----------------------------------------------------------------------------
# Stage builder: gera o build de produção
# -----------------------------------------------------------------------------
FROM base AS builder

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

RUN npm run build

# -----------------------------------------------------------------------------
# Stage production: imagem final mínima
# -----------------------------------------------------------------------------
FROM node:22-alpine AS production

RUN apk add --no-cache curl \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nextjs -u 1001

WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s \
    CMD curl -f http://localhost:3000 || exit 1

CMD ["node", "server.js"]
