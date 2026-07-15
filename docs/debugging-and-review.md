# Debugging and Code Review Notes

## AI Tool

Primary AI tool: **Cursor**.

---

## Debugging Notes

### 1. Port already in use (`EADDRINUSE :::3001`)

**Symptom:** `npm run dev` crashed because port 3001 was occupied by a leftover API process.

**Investigation:** Checked listening process with `lsof -ti :3001`.

**Fix:**
- Killed the stale process
- Added clearer `server.on('error')` handling in `apps/api/src/index.ts`
- Documented the issue in `prompt-history/06-debugging-port-conflict.md` and `docs/DEVELOPER_GUIDE.md`

**Lesson:** Background AI/smoke-test servers can leave ports busy; treat process hygiene as part of local DX.

### 2. Integration tests wiping seed data

**Symptom:** After tests, ticket list was empty in the UI.

**Investigation:** `beforeEach`/`afterAll` deleted all tickets/comments.

**Fix:** Cleanup scoped to known test titles only so seeded demo data survives.

### 3. TypeScript / Prisma client generation

**Symptom:** Build failures when Prisma enums were not generated / module resolution mismatch.

**Fix:** `npx prisma generate` after schema changes; API `tsconfig` adjusted for workable module resolution in this monorepo.

### 4. Docker Postgres volume path

**Symptom:** Risk of empty/non-persistent data with incorrect volume mount.

**Fix:** Use `/var/lib/postgresql/data` in `docker-compose.yml`.

---

## Code Review Notes (AI-assisted + human ownership)

Reviewed AI output against the assessment PDF and project spec:

| Check | Result |
|-------|--------|
| Status transitions enforced on backend (not UI-only) | Pass — pure module + service + 422 |
| Invalid transitions covered by tests | Pass — integration suite |
| Zod validates create/update/comment/status inputs | Pass |
| No secrets committed (`.env` ignored, `.env.example` present) | Pass |
| Seed users only (no auth Core scope) | Pass |
| Error response shape consistent for frontend toasts | Pass |

### AI suggestion corrected during review

Initial pattern risk: status validation living only inline in the route.

**Correction:** dedicated `state-machine/ticket-status.ts` with `assertValidTransition()` and `StatusTransitionError`, called from the service layer.

Also recorded in `reflection.md` and `prompt-history/03-database-and-api.md`.

---

## Edge cases considered

- Empty title/description on create → 400 via Zod
- Invalid status enum → 400 via Zod
- Valid enum but illegal transition → 422 via state machine
- Unknown ticket id (valid cuid format) → 404
- Invalid ticket id format → 400
- Empty comment message → 400
- Assignee that does not exist → 400 from service validation
