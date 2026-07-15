# Requirements

## Business Context

Internal support ticket management for creating, updating, commenting on, searching, and progressing tickets through a defined lifecycle.

## Core Entities

- **User** — seeded only (id, name, email, role)
- **Ticket** — id, title, description, priority, status, assignedTo, createdBy, timestamps
- **Comment** — id, ticketId, message, createdBy, createdAt

## Core Features

1. Create ticket
2. List tickets
3. View ticket details
4. Update ticket fields and assignee
5. Change status via enforced state machine
6. Add comments
7. Keyword search and status filter
8. Backend validation and meaningful UI error states
9. Data persistence across restarts

## Status State Machine

- OPEN → IN_PROGRESS, CANCELLED
- IN_PROGRESS → RESOLVED, CANCELLED
- RESOLVED → CLOSED
- CLOSED and CANCELLED are terminal

Invalid transitions must be rejected by the backend.

## Non-Functional

- README with local setup instructions
- No secrets in repository
- Integration tests for state machine rules
