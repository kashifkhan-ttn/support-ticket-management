# 04 — State Machine Integration Tests

**Tool:** Cursor  
**Phase:** Implementation Phase 5  
**Date context:** Mandatory test tier

---

## Prompt

> Write mandatory integration tests that prove the state-machine rules — valid transitions succeed, invalid transitions are rejected.

---

## AI Response (summary)

Created `apps/api/tests/status-transitions.integration.test.ts` with Vitest + Supertest:

**Valid (must succeed):**

- OPEN → IN_PROGRESS
- OPEN → CANCELLED
- IN_PROGRESS → RESOLVED
- IN_PROGRESS → CANCELLED
- RESOLVED → CLOSED

**Invalid (must be rejected with 422):**

- OPEN → RESOLVED / CLOSED
- IN_PROGRESS → OPEN
- RESOLVED → IN_PROGRESS / CANCELLED
- CLOSED → OPEN
- CANCELLED → IN_PROGRESS

Result after refinement: **15 tests passing**.

---

## Iteration

1. First version wiped all tickets in `beforeEach` / `afterAll`, which deleted seeded demo data.
2. Refined cleanup to only delete tickets with test titles, so `npm run db:seed` data survives tests.
3. Fixed a wrong expectation: unknown but valid-format ID returns **404**, not 400; invalid ID format returns **400**.

---

## Traceability

- Tests: `apps/api/tests/status-transitions.integration.test.ts`
- Notes: `docs/testing-notes.md`
