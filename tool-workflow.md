# AI Tool Workflow

## 1. Primary AI Tool Used

**Cursor** — used for spec-driven development, code generation, iteration, and debugging across the full stack.

## 2. How I Provide Project Context

- Created persistent context files in `tool-specific/cursor-workflow/` (project-context.md, spec.md, tasks.md, acceptance-criteria.md)
- Referenced `@spec.md` and `@acceptance-criteria.md` when starting new features
- Used workspace React rules for frontend conventions
- Kept architecture decisions in `docs/design.md` for cross-session continuity

## 3. How I Use AI for Requirement Analysis

- Started from the assessment PDF requirements
- Broke down entities, API contract, and state machine rules into `spec.md` before coding
- Mapped Core acceptance criteria to test cases in `acceptance-criteria.md`

## 4. How I Use AI for Planning and Design

- Defined phased implementation in `tasks.md`
- Chose monorepo structure, Prisma for migrations, and pure-function state machine for testability
- Documented trade-offs (no auth in Core, backend as source of truth for status) in `docs/design.md`

## 5. How I Use AI for Code Generation

- Generated API routes, validators, Prisma schema, and React pages incrementally by phase
- Used targeted prompts per layer (state machine, then services, then UI) rather than one-shot generation
- Applied existing shadcn/ui patterns for consistent UI components

## 6. How I Validate AI-Generated Code

- Ran integration tests after implementing the state machine
- Manually reviewed transition rules against the PDF spec
- Verified Zod schemas reject invalid input
- Tested UI error handling for 422 status transition failures

## 7. How I Use AI for Testing

- Generated integration test matrix covering all valid and invalid transitions
- Used AI to scaffold Supertest setup, then verified assertions match acceptance criteria
- Documented manual test checklist in `docs/testing-notes.md`

## 8. How I Use AI for Debugging

- Used AI to diagnose TypeScript module resolution (NodeNext + .js extensions)
- Fixed Prisma client import paths and ESM compatibility issues with targeted error messages
- Iterated on Docker volume path for PostgreSQL persistence

## 9. How I Use AI for Code Review

- Asked AI to review state machine isolation from HTTP layer
- Verified no secrets in committed files
- Checked that frontend status buttons align with backend rules without replacing backend enforcement

## 10. What Information I Avoid Sharing Unnecessarily

- No `.env` files or database credentials in prompts or commits
- No proprietary or client-specific data in prompt history
- Used generic example.com emails in seed data

## 11. How I Would Reuse This Workflow in a Real Project

- Maintain spec.md and acceptance-criteria.md as living documents
- Use cursor-rules for team conventions (validation, error format, test requirements)
- Incremental AI prompts tied to task checklist, not monolithic "build the app"
- Save prompt history for onboarding and workflow retrospectives
- Run integration tests for critical business rules before merging
