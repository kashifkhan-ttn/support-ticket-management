# Prompt History

Full prompt/chat history for the AI-assisted Support Ticket Management assessment.

These files show how Cursor was used across the lifecycle: requirement analysis → planning → implementation → testing → debugging → documentation.

## Index

| File | Topic | Phase |
|------|-------|-------|
| [01-requirements-analysis.md](./01-requirements-analysis.md) | PDF review & approach | Planning |
| [02-monorepo-scaffold.md](./02-monorepo-scaffold.md) | Repo structure & workflow docs | Foundation |
| [03-database-and-api.md](./03-database-and-api.md) | Prisma, API, state machine | Backend |
| [04-integration-tests.md](./04-integration-tests.md) | State-machine integration tests | Testing |
| [05-frontend-pages.md](./05-frontend-pages.md) | React pages & TanStack Query | Frontend |
| [06-debugging-port-conflict.md](./06-debugging-port-conflict.md) | EADDRINUSE fix | Debugging |
| [07-developer-guide.md](./07-developer-guide.md) | Setup / DB / package docs | Documentation |

## How to read each entry

Each file includes:

1. **Prompt** — what was asked
2. **AI response summary** — what was generated
3. **Iteration / correction** — where suggestions were reviewed or fixed
4. **Traceability** — where the outcome lives in the repo

## Notes for reviewers

- Primary AI tool: **Cursor**
- Spec-driven artifacts: `tool-specific/cursor-workflow/`
- Reflection of AI correction: see [03-database-and-api.md](./03-database-and-api.md) and root `reflection.md`
- Workflow overview: root `tool-workflow.md`
