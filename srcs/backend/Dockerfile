FROM node:20-alpine as builder

WORKDIR /app

COPY ./application/package*.json .

RUN npm install

COPY ./application .

EXPOSE 5000

EXPOSE 5432

ENTRYPOINT [ "npm", "run", "build"]
