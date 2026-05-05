FROM node:25-alpine AS builder

WORKDIR /app

COPY ./application/package*.json .

RUN npm install

COPY ./application .

ENTRYPOINT [ "npm", "run", "dev"]
