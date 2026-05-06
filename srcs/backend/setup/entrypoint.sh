#!/bin/sh
set -e

# Wait until Postgres responds
until psql ping -h"$DB_HOST" -P"$DB_PORT" --silent; do
  echo " Postgresql is unavailable - sleeping..."
  sleep 2
done

exec npm run dev
