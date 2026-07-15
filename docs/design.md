# Design Notes

## Architecture

Monorepo with `apps/api` (Express + Prisma) and `apps/web` (React + Vite).

```
Browser → React SPA → Express REST API → PostgreSQL
```

## API Layer

- REST endpoints under `/api/tickets` and `/api/users`
- Zod validation on all inputs
- Structured error responses: `{ message, errors: [{ field, message }] }`
- Status changes isolated to `PATCH /api/tickets/:id/status`

## State Machine

Implemented as a pure function module (`ticket-status.ts`) separate from HTTP and database layers. This makes integration tests straightforward and prevents UI-only enforcement.

## Frontend

- TanStack Query for server state and cache invalidation
- Status action buttons derived from `STATUS_TRANSITIONS` map (mirrors backend rules)
- Toast notifications for API errors including invalid transitions (422)
- Vite dev proxy forwards `/api` to the backend

## Database

PostgreSQL with Prisma ORM. Seed script creates 3 users, 5 tickets across all statuses, and sample comments.

## Trade-offs

- No authentication in Core — default seeded user acts as creator for API calls
- Frontend status map duplicates backend rules for UX; backend remains source of truth
- Integration tests use live DB (requires PostgreSQL running)
