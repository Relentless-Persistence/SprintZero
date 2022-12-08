# base Image
FROM node:18.12.1-alpine

# Create and change to the app directory
WORKDIR /usr/app

COPY . .

# Install production dependencies
RUN npm ci

RUN npm run build

CMD ["npm", "start"]