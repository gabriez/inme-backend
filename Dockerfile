FROM node:22.19.0-trixie

WORKDIR /app

ENV PORT=3030

COPY package*.json ./

RUN yarn install

COPY . .

EXPOSE $PORT

CMD ["yarn", "dev"]