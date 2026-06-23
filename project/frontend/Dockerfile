FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY ./application .

# NOTE: Using a shared folder inside a VM removed permissions for the files (problems loading the website images)
RUN chmod -R 755 .

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
