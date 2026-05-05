FROM node:20-alpine as builder

WORKDIR /app

COPY ./application/package*.json .

RUN npm install

COPY ./application .

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY ./conf/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 443

ENTRYPOINT [ "./setup/setup.sh" ]
