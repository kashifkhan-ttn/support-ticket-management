# Support Ticket Management System

AI-assisted full-stack assessment project: manage support tickets with enforced status lifecycle, comments, search, and filters.

## Primary AI Tool

**Cursor** — used for requirement analysis, planning, code generation, testing, debugging, code review, and documentation.

Evidence of AI usage:

| Artifact | Path |
|----------|------|
| AI workflow (11 sections) | [`tool-workflow.md`](tool-workflow.md) |
| Prompt chat history | [`prompt-history/`](prompt-history/) |
| Spec-driven Cursor docs | [`tool-specific/cursor-workflow/`](tool-specific/cursor-workflow/) |
| Reflection / trade-offs | [`reflection.md`](reflection.md) |
| PR rationale | [`pr.md`](pr.md) |
| Debugging & review notes | [`docs/debugging-and-review.md`](docs/debugging-and-review.md) |

## Stack

- **Frontend:** React 18, TypeScript, Vite, TailwindCSS, TanStack Query, React Router
- **Backend:** Node.js, Express, TypeScript, Zod
- **Database:** PostgreSQL with Prisma ORM
- **Validation:** Zod (request body/query/params); frontend forms via React Hook Form + Zod

## Prerequisites

- Node.js 20+
- Docker (for PostgreSQL) or a local PostgreSQL instance

## Setup

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Copy environment variables (**required** — includes `DATABASE_URL`):

```bash
cp .env.example .env
cp .env.example apps/api/.env
```

Default connection string (from [`.env.example`](.env.example)):

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/support_tickets
PORT=3001
VITE_API_URL=http://localhost:3001
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
| `npm run test` | Run API unit + integration tests |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run db:seed` | Seed sample users and tickets |
| `npm run db:up` | Start PostgreSQL via Docker |
| `npm run db:down` | Stop PostgreSQL container |

## Project Structure

```
apps/api/     Express REST API + Prisma + tests
apps/web/     React frontend
docs/         Requirements, design, testing, debugging notes
prompt-history/  Cursor prompt chat history
tool-specific/cursor-workflow/  Spec-driven AI workflow artifacts
```

## Developer Guide

For setup, debugging, code exploration, database access, and package reference, see **[docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md)**.

For tools/concepts (why used, pros/cons, alternatives), see **[docs/TOOLS_AND_CONCEPTS.md](docs/TOOLS_AND_CONCEPTS.md)** or the PDF **[docs/TOOLS_AND_CONCEPTS.pdf](docs/TOOLS_AND_CONCEPTS.pdf)**.

## Assessment Artifacts (checklist for reviewers)

- [x] `.env.example` with `DATABASE_URL`
- [x] `tool-workflow.md` — names Cursor + lifecycle AI usage
- [x] `prompt-history/` — multi-file prompt chat evidence
- [x] `tool-specific/cursor-workflow/` — project-context, spec, tasks, acceptance criteria
- [x] `docs/requirements.md`, `docs/design.md`, `docs/testing-notes.md`
- [x] `reflection.md`, `pr.md`
- [x] State-machine integration tests + unit tests
