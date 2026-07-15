import { TicketStatus } from '@prisma/client';

const VALID_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  OPEN: [TicketStatus.IN_PROGRESS, TicketStatus.CANCELLED],
  IN_PROGRESS: [TicketStatus.RESOLVED, TicketStatus.CANCELLED],
  RESOLVED: [TicketStatus.CLOSED],
  CLOSED: [],
  CANCELLED: [],
};

export function getValidNextStatuses(current: TicketStatus): TicketStatus[] {
  return VALID_TRANSITIONS[current];
}

export function canTransition(from: TicketStatus, to: TicketStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

export function assertValidTransition(from: TicketStatus, to: TicketStatus): void {
  if (!canTransition(from, to)) {
    throw new StatusTransitionError(from, to);
  }
}

export class StatusTransitionError extends Error {
  constructor(
    public readonly from: TicketStatus,
    public readonly to: TicketStatus,
  ) {
    super(`Invalid status transition from ${from} to ${to}`);
    this.name = 'StatusTransitionError';
  }
}
