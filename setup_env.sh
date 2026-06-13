#!/bin/bash

set -e

echo "Setting up dummy environment variables for ft_transcendence..."

# Ensure Folders Exist
mkdir -p project/frontend
mkdir -p project/backend
mkdir -p project/postgres

# Frontend .env
cat > project/frontend/.env <<EOF
SERVER_NAME=localhost
EOF

# Backend .env
cat > project/backend/.env <<EOF
DATABASE_URL="postgresql://transcendence_user:pass123@postgresql:5432/transcendence_db"
JWT_SECRET="super_secret_eval_key"
DB_HOST=postgresql
DB_PORT=5432
SMTP_EMAIL=42.transcendencettm@gmail.com
SMTP_PASSWORD=smkt envl paqp anld
EOF

# PostgreSQL .env
cat > project/postgres/.env <<EOF
POSTGRES_PASSWORD=pass123
POSTGRES_USER=transcendence_user
POSTGRES_DB=transcendence_db
EOF

echo "✅ .env files created successfully with dummy evaluation values!"
