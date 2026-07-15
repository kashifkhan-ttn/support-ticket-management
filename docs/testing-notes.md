# Testing Notes

## Mandatory Test Tier: State Machine Integration Tests

Location: `apps/api/tests/status-transitions.integration.test.ts`

### Valid transitions tested
- OPEN → IN_PROGRESS
- OPEN → CANCELLED
- IN_PROGRESS → RESOLVED
- IN_PROGRESS → CANCELLED
- RESOLVED → CLOSED

### Invalid transitions tested
- OPEN → RESOLVED
- OPEN → CLOSED
- IN_PROGRESS → OPEN
- RESOLVED → IN_PROGRESS
- RESOLVED → CANCELLED
- CLOSED → OPEN
- CANCELLED → IN_PROGRESS

### Additional validation tests
- Create ticket with empty title → 400
- Invalid ticket ID format → 400

## Running Tests

```bash
# Ensure PostgreSQL is running and migrated
npm run db:up
cp .env.example apps/api/.env
npm run db:migrate
npm run test
```

## Test Setup

- Uses Supertest against the Express app (no HTTP server needed)
- `beforeEach` creates fresh tickets in known statuses
- `afterAll` cleans up test tickets

## Manual Testing Checklist

- [ ] Create ticket from UI
- [ ] Search by keyword in title/description
- [ ] Filter by status
- [ ] Edit ticket fields and reassign
- [ ] Valid status buttons work; invalid ones hidden
- [ ] Invalid API transition returns toast error
- [ ] Add comment appears in thread
- [ ] Restart API — data persists
