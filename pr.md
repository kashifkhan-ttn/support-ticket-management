## Summary

Implements the Core Support Ticket Management System for the AI capability assessment using **Cursor** as the primary AI tool.

- Full-stack app: React + Express + PostgreSQL with Prisma
- Ticket CRUD, comments, keyword search, status filter
- Backend-enforced status state machine with integration + unit tests
- Cursor workflow artifacts, prompt history, reflection, and design docs

## Spec → Implementation Traceability

| Requirement | Implementation |
|-------------|----------------|
| Create/list/detail tickets | `apps/web/src/pages/*`, `apps/api/src/routes/index.ts` |
| Status state machine | `apps/api/src/state-machine/ticket-status.ts` |
| Search + filter | `GET /api/tickets?search=&status=` |
| Backend validation | Zod schemas in `apps/api/src/validators/ticket.ts` |
| Integration tests | `apps/api/tests/status-transitions.integration.test.ts` |
| Unit tests | `apps/api/tests/ticket-status.unit.test.ts`, `apps/api/tests/validators.unit.test.ts` |
| Cursor workflow | `tool-specific/cursor-workflow/` |

## Design rationale (short)

- **State machine as pure function:** easier to unit-test and keeps HTTP layer thin.
- **No auth in Core:** assessment focus is lifecycle evidence, not authentication.
- **Zod on requests, Prisma types on responses:** validate untrusted input; responses shaped by the DB layer.
- **Backend is source of truth for status:** frontend hides invalid actions for UX only.

## Test Plan

- [ ] `cp .env.example apps/api/.env`
- [ ] `npm run db:up && npm run db:migrate && npm run db:seed`
- [ ] `npm run dev` — verify UI at localhost:5173
- [ ] Create ticket, search, filter by status
- [ ] Update fields, reassign, add comment
- [ ] Test valid status transitions from detail page
- [ ] `npm run test` — unit + state machine integration tests pass
- [ ] Restart API — confirm data persists

## AI Workflow Evidence

- `tool-workflow.md` — lifecycle AI usage (primary tool: **Cursor**)
- `tool-specific/cursor-workflow/` — spec-driven development artifacts
- `prompt-history/` — representative prompts and corrections
- `reflection.md` — trade-offs and AI mistake corrected
- `docs/debugging-and-review.md` — debugging + review notes
