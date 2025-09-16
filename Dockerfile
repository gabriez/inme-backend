FROM node:22.19.0-trixie

WORKDIR /app

ENV PORT=3030

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

EXPOSE $PORT

CMD ["yarn", "dev"]