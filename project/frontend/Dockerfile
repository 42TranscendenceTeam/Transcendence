FROM node:20-alpine AS builder

WORKDIR /app

# vafernan - 11.05 - test to pass mock as true
ARG VITE_USE_MOCK
ENV VITE_USE_MOCK=$VITE_USE_MOCK
#vafernan - 11.05 - set backend API URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# vafernan - 11.05 - added this rule so the TestUser is available
COPY ./.env ./application/.env

COPY ./application .

RUN npm install

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
