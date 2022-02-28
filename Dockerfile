FROM mcr.microsoft.com/appsvc/node:10-lts
ENV NODE_ENV=production
ENV HOST 0.0.0.0
ENV PORT 8080
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .
EXPOSE 8080
RUN chown -R node /usr/src/app
USER node
ENTRYPOINT ["pm2", "start", "--no-daemon"]
