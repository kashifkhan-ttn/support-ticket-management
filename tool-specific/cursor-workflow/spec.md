# Specification — Support Ticket Management

## Entities

### User (seeded only)
- `id`, `name`, `email`, `role`

### Ticket
- `id`, `title`, `description`, `priority`, `status`
- `assignedTo` (User id, optional)
- `createdBy` (User id)
- `createdAt`, `updatedAt`

### Comment
- `id`, `ticketId`, `message`, `createdBy`, `createdAt`

## Enums

**Priority:** `LOW` | `MEDIUM` | `HIGH` | `URGENT`

**Status:** `OPEN` | `IN_PROGRESS` | `RESOLVED` | `CLOSED` | `CANCELLED`

## Status State Machine

| From | Allowed To |
|------|------------|
| OPEN | IN_PROGRESS, CANCELLED |
| IN_PROGRESS | RESOLVED, CANCELLED |
| RESOLVED | CLOSED |
| CLOSED | (terminal) |
| CANCELLED | (terminal) |

Invalid transitions → HTTP 422 with descriptive error.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tickets` | List tickets; query `search`, `status` |
| POST | `/api/tickets` | Create ticket |
| GET | `/api/tickets/:id` | Ticket detail with comments |
| PATCH | `/api/tickets/:id` | Update title, description, priority, assignee |
| PATCH | `/api/tickets/:id/status` | Change status (state machine enforced) |
| POST | `/api/tickets/:id/comments` | Add comment |
| GET | `/api/users` | List users for assignee dropdown |

## Validation

- Create: `title`, `description`, `priority` required
- Comment: `message` required, non-empty
- Status: must be valid enum and valid transition
- Assignee: must reference existing user if provided

## Frontend Pages

1. **Ticket List** — search + status filter, link to detail
2. **Create Ticket** — form with validation
3. **Ticket Detail** — view/edit fields, status actions (valid only), comments
