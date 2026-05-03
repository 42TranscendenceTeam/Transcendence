FROM node:20-alpine AS builder

WORKDIR /app

COPY ./application/package*.json .

RUN npm install

COPY ./application .

COPY ./setup/entrypoint.sh .

RUN npm run build

FROM nginx:alpine

RUN apk update && apk upgrade

RUN apk add openssl && rm -rf /var/cache/apk/*

COPY --from=builder /app/dist /usr/share/nginx/html

COPY --from=builder /app/entrypoint.sh .

COPY ./conf/nginx.conf /etc/nginx/conf.d/default.conf

RUN chmod 755 ./entrypoint.sh

EXPOSE 443

ENTRYPOINT [ "./entrypoint.sh" ]
