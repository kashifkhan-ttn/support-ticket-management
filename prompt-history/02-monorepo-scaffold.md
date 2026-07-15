# 02 — Monorepo Scaffold & Cursor Workflow Artifacts

**Tool:** Cursor  
**Phase:** Implementation Phase 1  
**Date context:** After plan approval

---

## Prompt

> Implement the plan as specified... starting with the first todo (scaffold monorepo, Docker Compose, .env.example, README). Create tool-specific/cursor-workflow docs before heavy coding.

---

## AI Response (summary)

Created:

- npm workspaces root (`apps/api`, `apps/web`)
- `docker-compose.yml` for PostgreSQL 16
- `.env.example` and `.gitignore`
- Cursor workflow docs under `tool-specific/cursor-workflow/`:
  - `project-context.md`
  - `spec.md`
  - `tasks.md`
  - `acceptance-criteria.md`
  - `cursor-rules-or-instructions.md`

---

## Iteration / refinement

- Docker volume path initially incorrect (`/data`) → corrected to `/var/lib/postgresql/data`
- Spec written before API/frontend implementation (spec-driven workflow)

---

## Traceability

- Root scripts: `package.json`
- DB config: `docker-compose.yml`
- Workflow docs: `tool-specific/cursor-workflow/`
