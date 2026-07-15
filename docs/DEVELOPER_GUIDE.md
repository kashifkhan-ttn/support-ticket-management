# Developer Guide — Setup, Debug, Explore & Database

A practical guide for working with the Support Ticket Management project day to day.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [First-Time Setup](#2-first-time-setup)
3. [Daily Development Workflow](#3-daily-development-workflow)
4. [Environment Variables](#4-environment-variables)
5. [How the Code Is Organized](#5-how-the-code-is-organized)
6. [Request Flow (How Data Moves)](#6-request-flow-how-data-moves)
7. [Exploring the Codebase](#7-exploring-the-codebase)
8. [Database — Connect & Run Queries](#8-database--connect--run-queries)
9. [Debugging Guide](#9-debugging-guide)
10. [Common Problems & Fixes](#10-common-problems--fixes)
11. [Package Reference](#11-package-reference)
12. [Useful Commands Cheat Sheet](#12-useful-commands-cheat-sheet)

---

## 1. Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | 20+ | Run API and frontend |
| **npm** | 9+ | Package manager (workspaces) |
| **Docker Desktop** | Latest | Run PostgreSQL locally |
| **Git** | Any | Version control |

Optional but useful:
- **Cursor / VS Code** — editing and debugging
- **Postman / Insomnia / curl** — test API directly
- **TablePlus / DBeaver / pgAdmin** — GUI database client

---

## 2. First-Time Setup

Run these from the **repository root** (`ai_full_stack/`):

```bash
# 1. Install all dependencies (root + apps/api + apps/web)
npm install

# 2. Create environment files
cp .env.example .env
cp .env.example apps/api/.env

# 3. Start PostgreSQL in Docker
npm run db:up

# 4. Apply database schema (migrations)
npm run db:migrate

# 5. Insert sample users, tickets, and comments
npm run db:seed

# 6. Start API + frontend together
npm run dev
```

Open the app:
- **Frontend:** http://localhost:5173
- **API health check:** http://localhost:3001/health

---

## 3. Daily Development Workflow

```bash
# Start everything
npm run dev

# Or run separately in two terminals
npm run dev:api    # Backend only → :3001
npm run dev:web    # Frontend only → :5173

# Run tests after backend changes
npm run test

# Re-seed database (wipes and recreates sample data)
npm run db:seed

# Stop database when done
npm run db:down
```

### What `npm run dev` does

It uses **concurrently** to run two processes:

| Process | Command | Port |
|---------|---------|------|
| API | `tsx watch src/index.ts` | 3001 |
| Web | `vite` | 5173 |

The frontend proxies `/api/*` requests to the backend (see `apps/web/vite.config.ts`), so the browser talks to `localhost:5173` and Vite forwards API calls to `localhost:3001`.

---

## 4. Environment Variables

Copy from [`.env.example`](../.env.example):

| Variable | Used by | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | API (Prisma) | PostgreSQL connection string |
| `PORT` | API | Server port (default `3001`) |
| `NODE_ENV` | API | `development` / `production` |
| `VITE_API_URL` | Web (optional) | API base URL; empty uses Vite proxy |

**Example `DATABASE_URL`:**
```
postgresql://postgres:postgres@localhost:5432/support_tickets
```

Format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`

> Never commit `.env` files. Only `.env.example` goes in git.

---

## 5. How the Code Is Organized

```
ai_full_stack/
├── apps/
│   ├── api/                          # Backend (Express + Prisma)
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # Database models & enums
│   │   │   ├── seed.ts               # Sample data script
│   │   │   └── migrations/           # SQL migration history
│   │   ├── src/
│   │   │   ├── index.ts              # Server entry — starts Express
│   │   │   ├── app.ts                # Express app setup (routes, middleware)
│   │   │   ├── routes/index.ts       # HTTP route handlers
│   │   │   ├── services/ticket.service.ts  # Business logic + DB calls
│   │   │   ├── validators/ticket.ts  # Zod request schemas
│   │   │   ├── state-machine/ticket-status.ts  # Status transition rules
│   │   │   ├── middleware/error-handler.ts
│   │   │   └── lib/prisma.ts         # Prisma client singleton
│   │   └── tests/                    # Integration tests (Vitest)
│   │
│   └── web/                          # Frontend (React + Vite)
│       └── src/
│           ├── main.tsx              # React entry point
│           ├── App.tsx               # Router setup
│           ├── pages/                # Ticket list, create, detail
│           ├── components/           # Layout + UI (shadcn-style)
│           ├── api/client.ts         # fetch wrapper for REST API
│           └── types/index.ts        # Shared TypeScript types
│
├── docs/                             # Project documentation
├── tool-specific/cursor-workflow/    # Spec & AI workflow artifacts
├── docker-compose.yml                # PostgreSQL container
└── package.json                      # Root workspace scripts
```

### Key files to read first

| If you want to understand… | Start here |
|----------------------------|------------|
| Database tables | `apps/api/prisma/schema.prisma` |
| API endpoints | `apps/api/src/routes/index.ts` |
| Business rules | `apps/api/src/services/ticket.service.ts` |
| Status lifecycle | `apps/api/src/state-machine/ticket-status.ts` |
| Frontend pages | `apps/web/src/pages/` |
| API calls from UI | `apps/web/src/api/client.ts` |

---

## 6. Request Flow (How Data Moves)

Example: **User creates a ticket**

```
Browser (Create Ticket form)
    ↓  POST /api/tickets  { title, description, priority }
Vite proxy (dev) → Express :3001
    ↓
routes/index.ts        → validates body with Zod
    ↓
ticket.service.ts      → createTicket() via Prisma
    ↓
PostgreSQL             → INSERT into "Ticket"
    ↓
Response JSON          → TanStack Query invalidates cache → UI updates
```

Example: **Status change**

```
Browser clicks "Move to In Progress"
    ↓  PATCH /api/tickets/:id/status  { status: "IN_PROGRESS" }
ticket.service.ts      → updateTicketStatus()
state-machine          → assertValidTransition(OPEN, IN_PROGRESS)
    ↓ valid → Prisma update
    ↓ invalid → HTTP 422 + error message → Toast in UI
```

### API endpoints

| Method | Endpoint | What it does |
|--------|----------|--------------|
| `GET` | `/api/tickets?search=&status=` | List + search + filter |
| `POST` | `/api/tickets` | Create ticket |
| `GET` | `/api/tickets/:id` | Ticket detail + comments |
| `PATCH` | `/api/tickets/:id` | Update title, description, priority, assignee |
| `PATCH` | `/api/tickets/:id/status` | Change status (state machine) |
| `POST` | `/api/tickets/:id/comments` | Add comment |
| `GET` | `/api/users` | List users (for assignee dropdown) |
| `GET` | `/health` | Health check |

### Status state machine

```
OPEN          → IN_PROGRESS, CANCELLED
IN_PROGRESS   → RESOLVED, CANCELLED
RESOLVED      → CLOSED
CLOSED        → (terminal)
CANCELLED     → (terminal)
```

Enforced in: `apps/api/src/state-machine/ticket-status.ts`

---

## 7. Exploring the Codebase

### Suggested reading order

1. **`tool-specific/cursor-workflow/spec.md`** — requirements and API contract
2. **`apps/api/prisma/schema.prisma`** — data model
3. **`apps/api/src/state-machine/ticket-status.ts`** — core business rule
4. **`apps/api/src/routes/index.ts`** — thin HTTP layer
5. **`apps/web/src/pages/ticket-list-page.tsx`** — main UI entry
6. **`apps/api/tests/status-transitions.integration.test.ts`** — expected behavior

### Test the API without the UI

```bash
# List tickets
curl http://localhost:3001/api/tickets

# Search
curl "http://localhost:3001/api/tickets?search=login&status=OPEN"

# Get one ticket (replace ID)
curl http://localhost:3001/api/tickets/<ticket-id>

# Create ticket
curl -X POST http://localhost:3001/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"From curl","priority":"HIGH"}'

# Change status
curl -X PATCH http://localhost:3001/api/tickets/<ticket-id>/status \
  -H "Content-Type: application/json" \
  -d '{"status":"IN_PROGRESS"}'
```

### Run integration tests

```bash
npm run test              # all API tests
npm run test:watch -w @app/api   # watch mode
```

Tests live in `apps/api/tests/` and hit the real database — PostgreSQL must be running.

---

## 8. Database — Connect & Run Queries

### Connection details (Docker setup)

| Setting | Value |
|---------|-------|
| Host | `localhost` |
| Port | `5432` |
| Database | `support_tickets` |
| User | `postgres` |
| Password | `postgres` |

Connection string:
```
postgresql://postgres:postgres@localhost:5432/support_tickets
```

---

### Option A — psql via Docker (quickest)

```bash
# Open interactive SQL shell inside the container
docker exec -it support-ticket-db psql -U postgres -d support_tickets
```

Once inside `psql`:

```sql
-- List tables
\dt

-- Describe a table
\d "Ticket"

-- List all tickets
SELECT id, title, status, priority FROM "Ticket";

-- Tickets with assignee name
SELECT t.title, t.status, u.name AS assignee
FROM "Ticket" t
LEFT JOIN "User" u ON t."assignedToId" = u.id;

-- Comments for a ticket
SELECT c.message, u.name, c."createdAt"
FROM "Comment" c
JOIN "User" u ON c."createdById" = u.id
WHERE c."ticketId" = '<paste-ticket-id>';

-- Exit
\q
```

> Prisma uses quoted PascalCase table names (`"Ticket"`, `"User"`, `"Comment"`).

---

### Option B — Prisma Studio (visual browser)

Best for exploring data without writing SQL.

```bash
cd apps/api
npx prisma studio
```

Opens http://localhost:5555 — browse and edit `User`, `Ticket`, `Comment` in a GUI.

---

### Option C — GUI client (TablePlus, DBeaver, pgAdmin)

Create a new PostgreSQL connection with the values from the table above.

**TablePlus example:**
1. New connection → PostgreSQL
2. Host: `localhost`, Port: `5432`
3. User: `postgres`, Password: `postgres`
4. Database: `support_tickets`

---

### Option D — Prisma CLI queries

```bash
cd apps/api

# Check migration status
npx prisma migrate status

# Regenerate client after schema changes
npx prisma generate

# Create a new migration (after editing schema.prisma)
npx prisma migrate dev --name describe_your_change

# Reset database (⚠️ deletes all data, re-runs migrations + seed)
npx prisma migrate reset
```

---

### Useful SQL queries

```sql
-- Count records
SELECT
  (SELECT COUNT(*) FROM "User") AS users,
  (SELECT COUNT(*) FROM "Ticket") AS tickets,
  (SELECT COUNT(*) FROM "Comment") AS comments;

-- Tickets by status
SELECT status, COUNT(*) FROM "Ticket" GROUP BY status;

-- Open tickets assigned to someone
SELECT t.title, u.name
FROM "Ticket" t
JOIN "User" u ON t."assignedToId" = u.id
WHERE t.status = 'OPEN';

-- Full ticket with comments
SELECT t.*, c.message, c."createdAt" AS comment_at
FROM "Ticket" t
LEFT JOIN "Comment" c ON c."ticketId" = t.id
WHERE t.id = '<ticket-id>';
```

---

### Database schema overview

**`User`** — seeded support agents/admins
- `id`, `name`, `email`, `role` (`AGENT` | `ADMIN`)

**`Ticket`** — support tickets
- `id`, `title`, `description`, `priority`, `status`
- `assignedToId`, `createdById`, `createdAt`, `updatedAt`

**`Comment`** — messages on tickets
- `id`, `ticketId`, `message`, `createdById`, `createdAt`

---

## 9. Debugging Guide

### Backend (API)

**1. Check the server is running**
```bash
curl http://localhost:3001/health
# Expected: {"status":"ok"}
```

**2. Watch API logs**  
The terminal running `npm run dev:api` prints errors and `console.error` output.

**3. Debug with Node inspector**
```bash
cd apps/api
node --inspect-brk ./node_modules/.bin/tsx src/index.ts
```
Then attach your editor debugger (VS Code → "Attach to Node").

**4. Test a single endpoint**  
Use curl or Postman to isolate UI vs API issues.

**5. Prisma query logging**  
In `apps/api/src/lib/prisma.ts`, temporarily add:
```typescript
new PrismaClient({ log: ['query', 'error', 'warn'] })
```

---

### Frontend (Web)

**1. Browser DevTools → Network tab**  
Filter by `api` — check request URL, status code, response body.

**2. Browser DevTools → Console**  
Look for fetch errors or React warnings.

**3. React Query DevTools (optional)**  
Can be added to `main.tsx` for cache inspection.

**4. Vite HMR**  
Most `.tsx` changes hot-reload instantly. If state looks stale, hard refresh (`Cmd+Shift+R`).

---

### Database

```bash
# Is the container running?
docker ps | grep support-ticket-db

# Container logs
docker logs support-ticket-db

# Can Prisma connect?
cd apps/api && npx prisma db pull --print
```

---

## 10. Common Problems & Fixes

| Problem | Cause | Fix |
|---------|-------|-----|
| `EADDRINUSE :::3001` | API already running | `lsof -ti :3001 \| xargs kill -9` |
| `EADDRINUSE :::5173` | Vite already running | `lsof -ti :5173 \| xargs kill -9` |
| `Can't reach database` | Docker not running | Start Docker Desktop → `npm run db:up` |
| Empty ticket list | DB not seeded | `npm run db:seed` |
| `Prisma Client not generated` | After schema change | `cd apps/api && npx prisma generate` |
| API proxy errors in Vite | API not started | Run `npm run dev:api` first |
| Tests delete seed data | Tests clean test tickets only now | Re-run `npm run db:seed` if needed |
| Migration failed | DB out of sync | `cd apps/api && npx prisma migrate status` |

---

## 11. Package Reference

### Root (`package.json`)

| Package | Type | Purpose |
|---------|------|---------|
| **concurrently** | dev | Run API + web dev servers in one terminal |

---

### Backend — `apps/api`

#### Runtime dependencies

| Package | Purpose |
|---------|---------|
| **express** | HTTP web framework — routes, middleware, JSON API |
| **@prisma/client** | Type-safe database client (auto-generated from schema) |
| **zod** | Request body/query validation with TypeScript inference |
| **cors** | Allow frontend (`localhost:5173`) to call the API |

#### Dev dependencies

| Package | Purpose |
|---------|---------|
| **typescript** | Type checking and compilation |
| **tsx** | Run TypeScript directly in dev (`tsx watch`) without manual build |
| **prisma** | CLI for migrations, schema, `prisma studio`, `prisma generate` |
| **vitest** | Test runner for integration tests |
| **supertest** | HTTP assertions against Express app in tests |
| **@types/express** | TypeScript types for Express |
| **@types/cors** | TypeScript types for CORS |
| **@types/node** | TypeScript types for Node.js APIs |
| **@types/supertest** | TypeScript types for Supertest |

---

### Frontend — `apps/web`

#### Runtime dependencies

| Package | Purpose |
|---------|---------|
| **react** / **react-dom** | UI library and DOM rendering |
| **react-router-dom** | Client-side routing (`/`, `/tickets/new`, `/tickets/:id`) |
| **@tanstack/react-query** | Server state — fetch, cache, refetch after mutations |
| **react-hook-form** | Form state and submission handling |
| **@hookform/resolvers** | Connect Zod schemas to React Hook Form |
| **zod** | Frontend form validation (same library as backend) |
| **@radix-ui/react-*** | Accessible UI primitives (select, label, toast, slot) |
| **class-variance-authority** | Variant-based component styling (button variants) |
| **clsx** | Conditional CSS class names |
| **tailwind-merge** | Merge Tailwind classes without conflicts (`cn()` helper) |
| **lucide-react** | Icons (search, arrow, ticket) |

#### Dev dependencies

| Package | Purpose |
|---------|---------|
| **vite** | Dev server, HMR, production bundler |
| **@vitejs/plugin-react** | React Fast Refresh support in Vite |
| **typescript** | Type checking |
| **tailwindcss** | Utility-first CSS framework |
| **postcss** | CSS processing pipeline for Tailwind |
| **autoprefixer** | Vendor prefixes in generated CSS |
| **@types/react** / **@types/react-dom** | TypeScript types for React |

---

### Infrastructure (not npm packages)

| Tool | Purpose |
|------|---------|
| **Docker Compose** | Runs PostgreSQL 16 container |
| **PostgreSQL** | Relational database for users, tickets, comments |

---

## 12. Useful Commands Cheat Sheet

```bash
# ─── Setup ───
npm install
cp .env.example apps/api/.env
npm run db:up && npm run db:migrate && npm run db:seed

# ─── Development ───
npm run dev
npm run dev:api
npm run dev:web

# ─── Build ───
npm run build

# ─── Testing ───
npm run test
npm run test:watch -w @app/api

# ─── Database ───
npm run db:up
npm run db:down
npm run db:migrate
npm run db:seed
cd apps/api && npx prisma studio
docker exec -it support-ticket-db psql -U postgres -d support_tickets

# ─── Troubleshooting ───
lsof -ti :3001 | xargs kill -9
lsof -ti :5173 | xargs kill -9
docker ps
curl http://localhost:3001/health
```

---

## Related Docs

- [README.md](../README.md) — quick start
- [requirements.md](./requirements.md) — feature requirements
- [design.md](./design.md) — architecture decisions
- [testing-notes.md](./testing-notes.md) — test strategy
- [tool-specific/cursor-workflow/spec.md](../tool-specific/cursor-workflow/spec.md) — API spec
