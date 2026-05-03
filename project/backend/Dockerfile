FROM node:25-alpine AS builder

WORKDIR /app

COPY ./application/package*.json .

RUN npm install

COPY ./application .

COPY ./setup/entrypoint.sh /entrypoint.sh

RUN chmod 755 /entrypoint.sh

ENTRYPOINT [ "/entrypoint.sh" ]
