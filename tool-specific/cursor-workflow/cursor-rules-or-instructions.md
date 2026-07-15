# Cursor Rules and Instructions

## Project Rules

1. **Spec-first:** Read `spec.md` and `acceptance-criteria.md` before implementing features.
2. **State machine in backend:** Never rely on UI-only status guards. Enforce transitions in `apps/api/src/state-machine/`.
3. **Validation:** Use Zod schemas for all request bodies. Return structured `{ errors: [{ field, message }] }`.
4. **No secrets:** Never commit `.env` files or API keys.
5. **Tests:** State-machine integration tests are mandatory Core deliverables.
6. **Simplicity:** Implement Core only unless Stretch is explicitly requested.

## Prompting Guidelines

- Reference `@tool-specific/cursor-workflow/spec.md` when starting new features
- Ask for incremental changes, not monolithic "build everything" prompts
- Review AI-generated state machine logic manually before accepting
- Save representative prompts to `prompt-history/`

## Code Style

- TypeScript strict mode
- 2-space indentation, single quotes
- Functional React components with hooks
- TanStack Query for server state
- shadcn/ui patterns for UI components

## When AI Makes Mistakes

- Fix in a dedicated commit with a clear message (e.g. `fix: enforce status transitions on backend`)
- Document the correction in `reflection.md`
