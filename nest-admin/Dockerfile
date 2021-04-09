FROM node:15.10

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .

CMD yarn run start:dev