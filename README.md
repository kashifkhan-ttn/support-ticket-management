# Support Ticket Management System

AI-assisted full-stack assessment project: manage support tickets with enforced status lifecycle, comments, search, and filters.

## Stack

- **Frontend:** React 18, TypeScript, Vite, TailwindCSS, TanStack Query, React Router
- **Backend:** Node.js, Express, TypeScript, Zod
- **Database:** PostgreSQL with Prisma ORM

## Prerequisites

- Node.js 20+
- Docker (for PostgreSQL) or a local PostgreSQL instance

## Setup

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
cp .env.example apps/api/.env
```

3. Start PostgreSQL:

```bash
npm run db:up
```

4. Run migrations and seed data:

```bash
npm run db:migrate
npm run db:seed
```

5. Start development servers (API on `:3001`, web on `:5173`):

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API + web concurrently |
| `npm run dev:api` | API only |
| `npm run dev:web` | Web only |
| `npm run test` | Run API integration tests |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run db:seed` | Seed sample users and tickets |
| `npm run db:up` | Start PostgreSQL via Docker |
| `npm run db:down` | Stop PostgreSQL container |

## Project Structure

```
apps/api/     Express REST API + Prisma + integration tests
apps/web/     React frontend
docs/         Requirements, design, testing notes
tool-specific/cursor-workflow/  Cursor AI workflow artifacts
```

## Developer Guide

For setup, debugging, code exploration, database access, and package reference, see **[docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md)**.

## Assessment Artifacts

- `tool-workflow.md` — AI workflow documentation
- `reflection.md` — Project reflection
- `prompt-history/` — Saved prompt history
- `tool-specific/cursor-workflow/` — Spec-driven development docs
