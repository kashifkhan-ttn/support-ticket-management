# Acceptance Criteria (Core)

1. A user can create a ticket via the UI.
2. A user can view all tickets from the database.
3. A user can open a ticket detail view.
4. A user can update ticket fields and reassign.
5. A user can add comments.
6. Status changes only through valid transitions; invalid ones are rejected.
7. Keyword search and status filter work.
8. Data remains available after restart.
9. Backend validation prevents invalid records.
10. No secrets committed to the repo.
11. State-machine integration tests pass.

## State Machine Test Cases

### Valid transitions (must succeed)
- OPEN → IN_PROGRESS
- OPEN → CANCELLED
- IN_PROGRESS → RESOLVED
- IN_PROGRESS → CANCELLED
- RESOLVED → CLOSED

### Invalid transitions (must be rejected with 422)
- OPEN → RESOLVED
- OPEN → CLOSED
- IN_PROGRESS → OPEN
- RESOLVED → IN_PROGRESS
- RESOLVED → CANCELLED
- CLOSED → OPEN
- CANCELLED → IN_PROGRESS
