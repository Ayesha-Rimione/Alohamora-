# Alohomora! — Full-Stack Setup Guide

Alohomora! is a career-readiness and academic-support platform for university students in Bangladesh. This monorepo contains the React + TanStack frontend and an Express + MySQL backend.

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 18 | https://nodejs.org |
| MySQL | ≥ 8.0 | Running locally or on a remote server |
| npm | ≥ 9 | Bundled with Node.js |

---

## Project Structure

```
Alohomora!/
├── src/                     # Frontend (React / TanStack Router / Vite)
│   ├── routes/              # All UI pages
│   ├── state/app-state.tsx  # Global React context + localStorage
│   ├── lib/api/             # API client (mock or real)
│   ├── data/                # Static demo data (clearly labelled)
│   └── lib/cgpa.ts          # Shared CGPA computation functions
│
├── backend/                 # Node.js / Express backend (separate server)
│   ├── prisma/
│   │   ├── schema.prisma    # Full database schema (21 models)
│   │   └── seed.ts          # Seeds skills, career roles, demo data
│   ├── src/
│   │   ├── app.ts           # Express app (CORS, middleware, routes)
│   │   ├── index.ts         # Server entry point
│   │   ├── config/          # env.ts, prisma.ts, groq.ts
│   │   ├── middleware/       # auth, error, rateLimit, validate
│   │   ├── modules/
│   │   │   ├── auth/        # Registration, login, email verify
│   │   │   ├── academic/    # Courses, CGPA, profile
│   │   │   ├── onboarding/  # Save/resume onboarding state
│   │   │   ├── skills/      # Career roles, skill ratings, Marauder Map
│   │   │   ├── professor-who/ # Groq AI chat sessions
│   │   │   └── extras/      # Opportunities, resources, deadlines, plan
│   │   ├── utils/           # cgpa.ts, coverage.ts, password.ts, tokens.ts
│   │   └── test/            # Unit tests (45 tests, no DB required)
│   ├── .env.example         # (Copy to .env, never commit real credentials)
│   ├── package.json
│   └── tsconfig.json
│
├── .env.example             # Frontend env template
└── API_CONTRACT.md          # Complete API documentation
```

---

## 1 — Frontend Setup

```powershell
# Install dependencies
npm install

# Start frontend dev server (mock API mode — no backend needed)
npm run dev
```

The frontend runs at **http://localhost:5173** and uses mock data by default (`VITE_USE_MOCK_API=true`).

---

## 2 — Backend Setup

### 2a. Create your environment file

```powershell
# Inside the backend directory, copy the template
Copy-Item backend\.env.example backend\.env
```

Open `backend\.env` and fill in your MySQL password:

```ini
DATABASE_URL="mysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/alohomora_db"
SESSION_SECRET="change-this-to-a-long-random-string-minimum-32-characters"
GROQ_API_KEY="gsk_your_groq_api_key_here"  # Get from https://console.groq.com
GROQ_MODEL="openai/gpt-oss-120b"
```

> **Important:** Never commit `backend/.env` to git. It is listed in `.gitignore`.

### 2b. Create the database

Open MySQL and run:

```sql
CREATE DATABASE alohomora_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2c. Run the database migration

```powershell
Set-Location backend
npx prisma migrate dev --name init --schema=prisma/schema.prisma
```

This creates all 21 tables with correct indexes, foreign keys, and constraints.

### 2d. Seed the database

```powershell
# Still inside backend/
npx tsx prisma/seed.ts
```

This inserts: 5 universities, 22 skills, 6 career roles, sample learning resources, and 3 demo internship listings (all marked `isDemo: true`).

### 2e. Start the backend

```powershell
# Development (auto-reloads on file change)
npx tsx watch src/index.ts

# OR build and run compiled JS
npm run build
npm run start
```

The backend runs at **http://localhost:5000**.

---

## 3 — Connect Frontend to Backend

Create a `.env` file in the **root** (frontend) directory:

```ini
VITE_API_URL=http://localhost:5000/api/v1
VITE_USE_MOCK_API=false
```

Restart the frontend dev server. The app will now use the real backend instead of mock data.

---

## 4 — Professor Who? (Groq AI)

1. Visit **https://console.groq.com** and create a free account
2. Generate an API key
3. Add `GROQ_API_KEY=gsk_your_key_here` and `GROQ_MODEL=openai/gpt-oss-120b` to `backend/.env`
4. Restart the backend

Without a Groq API key, Professor Who? returns a friendly development placeholder message instead of crashing.

---

## 5 — Running Tests

### Frontend tests
```powershell
npm test
```

### Backend unit tests (no database required)
```powershell
Set-Location backend
npx vitest run
```

Current status: **45/45 tests pass** ✅

---

## 6 — Useful Backend Commands

| Command | What it does |
|---------|-------------|
| `npx prisma studio --schema=prisma/schema.prisma` | Browse database in a GUI |
| `npx prisma migrate dev --schema=prisma/schema.prisma` | Create a new migration after schema changes |
| `npx prisma migrate reset --schema=prisma/schema.prisma` | Drop and rebuild the database (dev only) |
| `npx tsx prisma/seed.ts` | Re-seed all static data |
| `npx vitest run` | Run all backend unit tests |

---

## 7 — Security Notes

- Passwords are hashed with **bcrypt** (12 salt rounds) — never stored in plain text.
- Session tokens are stored in **HttpOnly, SameSite=Lax cookies** — inaccessible to JavaScript.
- The Groq API key exists **only on the server** — never exposed to the browser.
- Every student record enforces **ownership checks** — a student cannot read or modify another student's data.
- All input is validated with **Zod schemas** before reaching the database.
- SQL injection is prevented by **Prisma's parameterised queries**.
- Rate limiting protects `/auth/*` (25 req/15 min) and `/chat` (20 req/min).

---

## 8 — What Is Still Mock / Pending

| Feature | Status |
|---------|--------|
| Frontend mock API | ✅ Working (default mode) |
| Backend auth (register/login/verify) | ✅ Implemented |
| Academic records & CGPA | ✅ Implemented |
| Skill ratings & Marauder Map | ✅ Implemented |
| Onboarding save/resume | ✅ Implemented |
| Professor Who? (Groq chat) | ✅ Implemented (needs GROQ_API_KEY) |
| Opportunities & Resources | ✅ Implemented (demo data labelled) |
| Deadlines & Learning Plans | ✅ Implemented |
| Frontend ↔ Backend integration | ⏳ Phase 8 — set `VITE_USE_MOCK_API=false` |
| PDF upload & RAG | ⏳ Phase 6 |
| SMTP email dispatch | ⏳ Manual config (dev logs codes to terminal) |
| Deployment / production config | ⏳ Phase 8 |

---

## 9 — Development-Only Flows

When `SMTP_HOST` is empty (default), Alohomora! prints verification codes to the server terminal instead of sending emails:

```
======================================================
[ALOHOMORA! DEV VERIFICATION CODE]
Recipient: student@iubat.edu (Ayesha Rahman)
Verification Code: 482910
Expires in: 15 minutes
======================================================
```

This is clearly labelled and only active in `NODE_ENV=development`. Production requires a real SMTP provider.
