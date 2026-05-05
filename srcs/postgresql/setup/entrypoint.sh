#!/bin/bash

set -e

# Initialise database cluster
initdb -D /var/lib/postgres/data

# Start postgres server
# Listen on every address, on port 5432
pg_ctl -D "/var/lib/postgres/data" -o "-c listen_addresses=0.0.0.0:5432" -w start

# Create user
psql -v ON_ERROR_STOP=1 -d postgres -c "CREATE USER ${DB_USER} WITH PASSWORD ${DB_PASS};"

# Create database
psql -v ON_ERROR_STOP=1 -d postgres -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"

# Stop internal postgres server
pg_ctl -D "/var/lib/postgres/data" -m fast -w stop

exec "postgres"
