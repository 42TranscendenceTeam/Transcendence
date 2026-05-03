#!/bin/sh
set -e

# Wait until Postgres responds
while ! nc "$DB_HOST" "$DB_PORT"; do
  echo " Postgresql is unavailable - sleeping..."
  sleep 2
done

echo "Backend is running"

exec npm run dev
