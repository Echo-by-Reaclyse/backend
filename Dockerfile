# syntax=docker/dockerfile:1

# ── Build ────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json .
COPY src ./src
RUN npm run build

# ── Run ──────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# esbuild produces a single self-contained bundle — no node_modules needed
COPY --from=builder /app/dist/index.js ./dist/index.js

EXPOSE 3000

# Run as non-root
USER node

CMD ["node", "dist/index.js"]
