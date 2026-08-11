# stage 1 - build
FROM node:20-alpine AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm exec prisma generate

RUN pnpm run build

# stage 2 - production runtime
FROM node:20-alpine

WORKDIR /app

# dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# copying built application and node_modules from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# creating non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

RUN chown nestjs:nodejs /app/prisma.config.ts && \
    chown -R nestjs:nodejs /app/prisma

USER nestjs

ENV PORT=5200
EXPOSE 5200

# health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "const p=process.env.PORT||5200;require('http').get('http://127.0.0.1:'+p+'/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD ["node", "dist/src/main.js"]