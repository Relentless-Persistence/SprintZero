# Install packages
FROM node:hydrogen-alpine3.15
WORKDIR /app
COPY package.json pnpm-lock.yamp ./
RUN corepack enable
RUN pnpm install

# Build
FROM node:hydrogen-alpine3.15
WORKDIR /app
COPY --from=0 /app/node_modules ./node_modules
RUN pnpm build

# Run
FROM node:hydrogen-alpine3.15
WORKDIR /app
ENV NODE_ENV production
COPY --from=1 /app/.next ./.next
COPY --from=1 /app/node_modules ./node_modules
COPY --from=1 /app/package.json ./package.json

CMD ["pnpm", "start"]
