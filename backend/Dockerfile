# stage 1 - build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci && \
    npm cache clean --force

COPY . .

RUN npx prisma generate

RUN npm run build

# stage 1 - production runtime

FROM node:20-alpine

WORKDIR /app

#dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# copying built application and node_modules from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# creating non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

USER nestjs

EXPOSE 3000

# health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# using dumb-init to run the application
ENTRYPOINT ["/usr/sbin/dumb-init", "--"]

# Run the application
CMD ["node", "dist/main"]
