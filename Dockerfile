# Install packages
FROM node:hydrogen-alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN corepack enable
RUN pnpm install --frozen-lockfile

# Build
FROM node:hydrogen-alpine
WORKDIR /app

COPY --from=0 /app/node_modules ./node_modules
COPY . .

RUN corepack enable
RUN pnpm build

# Run
FROM node:hydrogen-alpine
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=1 /app/public ./public
COPY --from=1 --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=1 --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

RUN corepack enable
CMD ["pnpm", "start"]
