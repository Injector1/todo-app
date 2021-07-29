FROM node:12.13-alpine

WORKDIR /app

COPY package*.json ./

RUN yarn

COPY . .

RUN yarn prisma generate

COPY ./dist ./dist

CMD ["yarn", "start:dev"]