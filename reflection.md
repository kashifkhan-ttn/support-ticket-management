# Reflection

## What Went Well

- Spec-first approach kept scope focused on Core requirements
- Isolating the status state machine as a pure function made integration tests clear and reliable
- Monorepo with shared npm workspaces simplified running API and web together
- TanStack Query reduced boilerplate for cache invalidation after mutations

## Key Decisions and Trade-offs

- **No authentication in Core** — simplified the project while meeting assessment requirements; default seeded user handles create/comment actions
- **Prisma over raw SQL** — faster schema iteration with built-in migrations and seed support
- **Frontend status map mirrors backend** — improves UX by hiding invalid actions, but backend remains the enforcement point

## AI Mistake Corrected

An initial AI suggestion placed status transition validation only in the route handler inline. I refactored to a dedicated `state-machine/ticket-status.ts` module with `assertValidTransition()` and explicit `StatusTransitionError`. This improved testability and matched the spec requirement that invalid transitions be rejected at the backend with clear errors.

## What I Would Improve

- Add unit tests for Zod validators and the state machine function in isolation
- Implement Stretch features: pagination, priority/assignee filters, OpenAPI docs
- Add Docker Compose service for the API to simplify onboarding
- Use a dedicated test database to avoid test data interfering with dev seed data

## Ownership

I can explain every layer: the state machine rules, API validation flow, Prisma relations, and how the frontend derives available status actions. The solution is not a blind copy-paste — business rules were reviewed against the PDF and encoded in both tests and code.
