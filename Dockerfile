FROM node:18 as base

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./
COPY src ./src/

RUN yarn

CMD [ "node", "./src/bot.js" ]