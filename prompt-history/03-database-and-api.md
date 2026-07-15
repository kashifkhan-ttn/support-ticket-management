# 03 — Database Schema, API & State Machine

**Tool:** Cursor  
**Phase:** Implementation Phases 2–3  
**Date context:** Core backend delivery

---

## Prompt

> Define Prisma schema for User/Ticket/Comment with migrations and seed. Implement REST API with Zod validation, search/filter, and backend-enforced status state machine.

---

## AI Response (summary)

Implemented:

- Prisma models: `User`, `Ticket`, `Comment` + enums
- Migration: `apps/api/prisma/migrations/20250623120000_init/`
- Seed: 3 users, 5 tickets, 3 comments
- Express routes under `/api/tickets` and `/api/users`
- Pure state machine module: `apps/api/src/state-machine/ticket-status.ts`

Valid transitions enforced:

```
OPEN → IN_PROGRESS | CANCELLED
IN_PROGRESS → RESOLVED | CANCELLED
RESOLVED → CLOSED
```

Invalid transitions → HTTP 422

---

## AI mistake corrected

**Initial suggestion risk:** putting status validation only inline in the route handler.

**Correction:** extracted to a dedicated pure-function module with `assertValidTransition()` and `StatusTransitionError`, then called from the service layer. This made integration tests clearer and matched the assessment expectation that engineering judgment shows in the state machine.

Documented also in `reflection.md`.

---

## Traceability

- Schema: `apps/api/prisma/schema.prisma`
- State machine: `apps/api/src/state-machine/ticket-status.ts`
- Service: `apps/api/src/services/ticket.service.ts`
- Routes: `apps/api/src/routes/index.ts`
