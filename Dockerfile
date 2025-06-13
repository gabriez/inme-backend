FROM node:16.13.0-alpine3.14

LABEL version="0.0.1"
LABEL maintaner="Gallbers Gallardo - Gitlab/Github: @gagzu"

WORKDIR /app

COPY package*.json ./

RUN yarn install

COPY . .

EXPOSE 3000

CMD ["yarn", "dev"]