# Prompt History

This folder contains representative prompts used during AI-assisted development.

## How to Export from Cursor

1. Open relevant chat sessions in Cursor
2. Copy key prompts and responses into numbered files (e.g. `01-requirements-analysis.md`, `02-state-machine.md`)
3. Include iteration prompts where AI output was corrected

## Representative Prompt Topics

1. Requirement analysis from assessment PDF
2. Repository structure and monorepo setup
3. Prisma schema and seed data design
4. State machine implementation and integration tests
5. React pages with TanStack Query
6. Error handling for invalid status transitions

## Sample Entry

**Prompt:** Implement the ticket status state machine as a pure function module. Valid transitions: OPEN→IN_PROGRESS|CANCELLED, IN_PROGRESS→RESOLVED|CANCELLED, RESOLVED→CLOSED. Invalid transitions must throw StatusTransitionError.

**Outcome:** Created `apps/api/src/state-machine/ticket-status.ts` with `canTransition`, `assertValidTransition`, and integration tests proving backend rejection of invalid transitions.
