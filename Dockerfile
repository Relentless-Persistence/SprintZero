# Install packages
FROM node:hydrogen-alpine3.15
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable
RUN pnpm install

# Build
FROM node:hydrogen-alpine3.15
WORKDIR /app
COPY --from=0 /app/node_modules ./node_modules
RUN corepack enable
RUN pnpm build

# Run
FROM node:hydrogen-alpine3.15
WORKDIR /app
ENV NODE_ENV production
COPY --from=1 /app/.next ./.next
COPY --from=1 /app/node_modules ./node_modules
COPY --from=1 /app/package.json ./package.json
RUN corepack enable

CMD ["pnpm", "start"]
