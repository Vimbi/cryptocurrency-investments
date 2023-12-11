FROM node:16.16.0-alpine3.16
WORKDIR /usr/src/app
COPY package*.json yarn.lock ./
RUN yarn install --frozen-lockfile --production
COPY . .
RUN yarn build
CMD ["npm", "run", "start"]
