# Project Context

## Overview

Support Ticket Management System — a full-stack assessment project for managing internal support tickets with enforced status lifecycle, comments, search, and filters.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS, TanStack Query, React Router |
| Backend | Node.js, Express, TypeScript, Zod |
| Database | PostgreSQL 16 via Docker |
| ORM | Prisma |
| Tests | Vitest + Supertest |

## Repository Layout

```
apps/api/          Express REST API, Prisma, integration tests
apps/web/          React SPA
docs/              Requirements, design, testing notes
tool-specific/cursor-workflow/   Spec-driven AI workflow artifacts
```

## Conventions

- TypeScript strict mode everywhere
- Named exports for utilities; default exports for page components
- kebab-case file names
- Zod validation on all API inputs
- Status transitions enforced in backend state machine (not UI-only)
- No secrets in repository — use `.env` from `.env.example`
- API errors return `{ errors: [{ field, message }] }`

## Default User Context

Users are seeded in the database. No authentication in Core — the first seeded user is used as the default actor for create/comment actions.

## Key Business Rule

Ticket status follows a strict state machine. Invalid transitions must be rejected by the API with HTTP 422.
