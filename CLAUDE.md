# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A **Level 1 vibe-coding starter template** for French-speaking teenage students at Reboot Conseil. Students describe in plain language what they want; Claude implements it. There is no test suite — manual verification (run the app, click around) is the test.

Sub-directories each have their own CLAUDE.md with more detail:
- `backend/CLAUDE.md` — FastAPI guidance
- `frontend/CLAUDE.md` — React/Vite/TS/Tailwind guidance

## Your role

Students **do not write code themselves**. When a student asks for a feature or visual change, write the real working implementation — do not leave `# TODO` or `// TODO` placeholders. Explain what you did in plain, non-jargon French (or French-friendly terms).

Keep changes scoped to what was asked. Favor the simplest thing that works.

## Architecture

```
Dossier Etudiant/
├── backend/        FastAPI (Python) — single file: main.py
├── frontend/       React + TypeScript + Tailwind (Vite) — main entry: src/App.tsx
├── docker-compose.yml   runs both services together (local prod simulation)
├── start.sh             dev mode: backend + frontend without Docker
├── local.sh             Docker Compose shortcut (mirrors Railway)
└── stop.sh              kills any leftover processes on ports 8000/5173/3000
```

The frontend calls the backend via relative `/api/...` paths:
- In **dev** (`./start.sh`): Vite proxies `/api` → `http://localhost:8000`
- In **Docker / production**: nginx proxies `/api` → the backend container

The backend exposes:
- `GET /health` — healthcheck (used by Railway)
- `POST /api/example` — starter endpoint the student replaces with real logic

Secrets (API keys, etc.) live in `.env` at the root (loaded by `start.sh` and `docker-compose.yml`) and in `backend/.env` (for the venv workflow). Never hardcode secrets; read them with `os.environ.get(...)`.

## Commands

**Recommended for daily coding (no Docker):**
```bash
./start.sh          # installs deps on first run, then starts both servers
# frontend → http://localhost:5173  (hot-reload)
# backend  → http://localhost:8000  (auto-reload, /docs available)
./stop.sh           # if a server stays stuck after Ctrl+C
```

**To simulate production (Docker):**
```bash
./local.sh          # builds images, runs docker compose up
# app → http://localhost:3000
```

**Backend only:**
```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend only:**
```bash
cd frontend
npm install
npm run dev         # dev server
npm run build       # production build (tsc -b && vite build)
```

## Conventions

- Comments in French, focused on *why*, not *what*.
- Frontend: TypeScript strict mode is on — fix type errors, never use `any` or `@ts-ignore`.
- Backend: `allow_origins=["*"]` is intentional at this level — don't restrict it.
- When adding a new secret, add its name (not its value) to `backend/.env.example` as well.
- Keep `backend/main.py` as a single file until the project genuinely needs splitting.

## Deployment (Railway)

Two separate Railway services, same GitHub repo:
- **backend** — Root Directory: `backend`, add env vars from `.env`
- **frontend** — Root Directory: `frontend`, add `BACKEND_URL=<backend Railway URL>`
