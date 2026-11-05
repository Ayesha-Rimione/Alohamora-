# How to Run the **Alohomora!** Website

This guide walks you through the full local development setup for the
Alohomora! prototype (frontend + backend) on a Windows machine. It assumes
you have **Git**, **Node.js ≥ 20**, **npm**, and **MySQL** installed.

---

## 1️⃣ Prerequisites

| Tool | Version | Why we need it |
|------|---------|----------------|
| **Git** | any recent version | cloning the repo |
| **Node.js** | 20.x or newer | runs the TypeScript/React frontend and the Express backend |
| **npm** (bundled with Node) | 9.x or newer | package manager |
| **MySQL** | 8.x (or compatible) | persistent data store |
| **Docker** *(optional)* | – | you can run MySQL in a container if you prefer |

> **Tip:** If you use **nvm** (Node Version Manager) you can switch Node
> versions easily with `nvm use`.

---

## 2️⃣ Clone the repository

```bash
# From a location of your choice
git clone https://github.com/your‑org/alohomora.git  # <-- replace with the real URL
cd alohomora
```

The repository already contains the TanStack‑Start + React + TypeScript
frontend and the Node/Express + Prisma backend.

---

## 3️⃣ Install dependencies

```bash
# Install backend deps
cd backend
npm ci   # installs exact versions from package‑lock.json

# Install frontend deps
cd ..
cd src   # the frontend lives in the root `src` folder
npm ci
```

> **Why `npm ci`?** – It guarantees a reproducible install without
> updating `package-lock.json`.

---

## 4️⃣ Set up environment variables

### 4.1 Backend (`backend/.env`)
Create a file called `.env` inside `backend/` with at least the
following keys (replace placeholders with your own values):

```dotenv
# Database URL – change user/password/database as needed
DATABASE_URL="mysql://alohomora_user:your_password@localhost:3306/alohomora_db"

# Session secret – a long random string
SESSION_SECRET="CHANGE_ME_TO_A_RANDOM_STRING"

# Optional – Groq API key (if you want the real AI assistant)
# GROQ_API_KEY="your‑groq‑key"
```

> **Important:** Never commit real passwords or secrets to the repo.
> `.env` is already ignored by `.gitignore`.

### 4.2 Frontend (`.env` at project root)
Create a file called `.env` (or `.env.local`) in the project root:

```dotenv
VITE_API_URL="http://localhost:5000/api/v1"
VITE_USE_MOCK_API=false   # set to true only for the demo‑account mode
```

---

## 5️⃣ Database preparation

1. **Create the database** (once):
   ```sql
   CREATE DATABASE alohomora_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. **Run Prisma migrations** (creates tables):
   ```bash
   cd backend
   npx prisma migrate dev --name init   # the migration will be applied automatically
   ```
3. **Seed the curriculum** (adds the IUBAT CSE B231 courses):
   ```bash
   npx tsx src/seed/seedCurriculum.ts
   ```
   You should see output similar to:
   ```
   Inserted 59 curriculum courses.
   Counts per semester: [{"semester":1,"_count":{"_all":6}}, ...]
   ``` 
4. (Optional) **Seed demo user** – a demo account is created on first
   login via the “Try demo account” button, no manual seeding needed.

---

## 6️⃣ Run the servers 

### 6.1 Backend (Express API)
```bash
cd backend
npm run dev   # starts the server on http://localhost:5000
```
The console should show:
```
✅ Database connection established.
✅ Server running at http://localhost:5000
   API prefix: /api/v1
   Frontend origin: http://localhost:5173
```

### 6.2 Frontend (Vite dev server)
```bash
cd ..   # back to repo root
npm run dev   # starts Vite on http://localhost:8080
```
You’ll see something like:
```
➜  Local:   http://localhost:8080/
➜  Network: http://192.168.0.xxx:8080/
```
Open the URL in your browser.

---

## 7️⃣ Verify everything works

1. Visit `http://localhost:8080` – you should see the landing page.
2. Click **Create account**, register a new student, verify using the
   console‑printed 6‑digit code, and walk through the onboarding wizard.
3. After finishing, you land on the **Great Hall** dashboard showing
   your real data (no demo courses).
4. Open the **Marauder Map** – coverage numbers should match the backend
   response.
5. (Optional) Test the **demo account**: click “Try demo account” on the
   login page – you’ll be logged in as a pre‑seeded demo user with a
   banner that says *Demo mode – data is sample only*.

---

## 8️⃣ Common commands

| Command | Description |
|--------|-------------|
| `npm run dev` (backend) | Starts the Express API with hot‑reload (`tsx watch`). |
| `npm run dev` (frontend) | Starts Vite dev server. |
| `npm test` (backend) | Runs Jest unit tests (including CGPA and isolation tests). |
| `npx prisma migrate dev` | Applies migrations. |
| `npx tsx src/seed/seedCurriculum.ts` | Re‑seeds the curriculum (useful after DB reset). |
| `npm run lint` | Runs ESLint/Prettier checks. |

---

## 9️⃣ Troubleshooting

* **“Cannot connect to MySQL”** – make sure the `DATABASE_URL` points to a
  running MySQL instance and that the user has CREATE/INSERT privileges.
* **Port already in use** – change the ports in `.env` (`VITE_API_URL`
  and `backend/src/app.ts` `PORT` variable) or kill the process that is
  using the port.
* **Missing env variables** – the server will abort with a clear error
  message showing which key is missing.
* **Frontend cannot reach the API** – ensure the backend is listening on
  `http://localhost:5000` and that CORS is correctly configured (the
  backend already allows `http://localhost:8080`).

---

## 🔑 Quick start (one‑liner)
```bash
# Clone, install, seed, and run everything in one go (assumes MySQL is ready)
git clone https://github.com/your‑org/alohomora.git && cd alohomora && \
  (cd backend && npm ci && cp .env.example .env && npx prisma migrate dev && npx tsx src/seed/seedCurriculum.ts && npm run dev &) && \
  (npm ci && npm run dev)
```
Replace the placeholder repo URL and fill the `.env` files as described.

---

**You now have a fully functional local copy of Alohomora!** Feel free to
explore, add features, or run the UI tests. Happy coding! 🎓✨
