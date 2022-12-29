# Install packages
FROM node:hydrogen-alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# Build
FROM node:hydrogen-alpine
WORKDIR /app
RUN corepack enable

COPY --from=0 /app/node_modules ./node_modules
COPY . .

RUN pnpm build

# Run
FROM node:hydrogen-alpine
WORKDIR /app
RUN corepack enable

ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=1 /app/public ./public
COPY --from=1 --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=1 --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

CMD ["pnpm", "start"]
