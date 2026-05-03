#!/bin/bash
set -e

mkdir -p /etc/nginx/certs

# NOTE: Define server name in .env file
if [ ! -f "/etc/nginx/certs/cert.pem" ] || [ ! -f "/etc/nginx/certs/key.pem" ]; then
	openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
		-keyout /etc/nginx/certs/key.pem \
		-out /etc/nginx/certs/cert.pem \
		-subj "/C=PT/ST=Porto/L=Porto/O=42/OU=Students/CN=${SERVER_NAME}"
fi

exec nginx -g "daemon off;"
