# 06 — Debugging: EADDRINUSE Port Conflict

**Tool:** Cursor  
**Phase:** Debugging  
**Date context:** After first `npm run dev` attempts

---

## Prompt

> When I do npm run dev, this error logs are appearing:
> `Error: listen EADDRINUSE: address already in use :::3001`

---

## AI Response (summary)

Diagnosis: a leftover API process from an earlier smoke test still held port 3001.

Actions:

1. Killed process on port 3001: `lsof -ti :3001 | xargs kill -9`
2. Added clearer server error handling in `apps/api/src/index.ts` for `EADDRINUSE`
3. Fixed a brief duplicate `PORT` declaration introduced during the edit
4. Re-verified `npm run dev` — API `:3001` and Vite `:5173` both started cleanly

---

## What I learned

- Don’t leave background `tsx watch` / previous `npm run dev` sessions running
- Port conflicts look like app bugs but are local process conflicts
- Prefer a readable exit message over an unhandled server error event

---

## Traceability

- Fix location: `apps/api/src/index.ts`
- Also documented in: `docs/DEVELOPER_GUIDE.md` (Common Problems)
