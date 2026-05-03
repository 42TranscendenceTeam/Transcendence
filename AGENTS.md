# ft_transcendence — Agent Guide

## Project Overview
Docker-based fullstack app: React frontend (nginx+SSL), Node/Express backend, PostgreSQL.

## Developer Commands
| Command | Action |
|---|---|
| `make all` | Build + start all services |
| `make stop` | Stop containers |
| `make clean` | Stop + remove containers, keep DB |
| `make re` | Full rebuild (clean + all) |
| `make frontRebuild` | Rebuild frontend only |
| `make backRebuild` | Rebuild backend only |
| `make dataRebuild` | Rebuild database only |

For local backend dev: `cd srcs/backend/application && npm run dev`
For local frontend dev: `cd srcs/frontend/application && npm run dev`

## Architecture
```
srcs/
  frontend/       React + Vite + Tailwind + nginx (SSL port 443)
  backend/        Express + Prisma (port 5000)
  postgresql/     Postgres 18 (port 5432)
```
- Frontend Dockerfile: multi-stage build (Node → nginx), entrypoint.sh generates self-signed SSL certs via openssl
- Backend Dockerfile: entrypoint.sh waits for PostgreSQL via `psql ping` before starting
- Volumes: PostgreSQL data bound to `${HOME}/data/database`
- Network: `transcendence` bridge

## Key Quirks
- **Prisma output path** is `src/generated/prisma` (not `node_modules/.prisma`) — import from there
- **Prisma provider** is `"prisma-client"` (new v7 style), NOT `"prisma-client-js"`
- **DATABASE_URL** must be set in `srcs/backend/application/.env` for Prisma CLI to work locally
- **No lint/typecheck/CI** configured — project uses no ESLint, Prettier, or GitHub Actions
- Prisma schema (`prisma/schema.prisma`) is minimal — DB models need to be defined

## Env Files
| Service | File |
|---|---|
| Frontend | `srcs/frontend/.env` (`SERVER_NAME`) |
| Backend | `srcs/backend/.env` (empty), `srcs/backend/application/.env` (`DATABASE_URL`, `JWT_SECRET`) |
| PostgreSQL | `srcs/postgresql/.env` (`DB_USER`, `DB_PASS`, `DB_NAME`) |

## Notes
- `npm run dev` in backend uses `tsx watch` (TypeScript execution without compile step)
- Frontend served statically via nginx; Vite dev server (`npm run dev` in frontend) runs separately for hot reload
- No API proxy configured in nginx — backend and frontend are served independently
- Socket.IO (real-time) not yet wired up