import { TicketStatus } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import {
  assertValidTransition,
  canTransition,
  getValidNextStatuses,
  StatusTransitionError,
} from '../src/state-machine/ticket-status.js';

describe('ticket status state machine (unit)', () => {
  it('returns valid next statuses for OPEN', () => {
    expect(getValidNextStatuses(TicketStatus.OPEN)).toEqual([
      TicketStatus.IN_PROGRESS,
      TicketStatus.CANCELLED,
    ]);
  });

  it('returns empty next statuses for terminal states', () => {
    expect(getValidNextStatuses(TicketStatus.CLOSED)).toEqual([]);
    expect(getValidNextStatuses(TicketStatus.CANCELLED)).toEqual([]);
  });

  it('allows known valid transitions', () => {
    expect(canTransition(TicketStatus.OPEN, TicketStatus.IN_PROGRESS)).toBe(true);
    expect(canTransition(TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED)).toBe(true);
    expect(canTransition(TicketStatus.RESOLVED, TicketStatus.CLOSED)).toBe(true);
  });

  it('rejects invalid transitions', () => {
    expect(canTransition(TicketStatus.OPEN, TicketStatus.RESOLVED)).toBe(false);
    expect(canTransition(TicketStatus.CLOSED, TicketStatus.OPEN)).toBe(false);
    expect(canTransition(TicketStatus.RESOLVED, TicketStatus.CANCELLED)).toBe(false);
  });

  it('throws StatusTransitionError for invalid assert', () => {
    expect(() =>
      assertValidTransition(TicketStatus.OPEN, TicketStatus.CLOSED),
    ).toThrow(StatusTransitionError);
  });

  it('does not throw for valid assert', () => {
    expect(() =>
      assertValidTransition(TicketStatus.OPEN, TicketStatus.IN_PROGRESS),
    ).not.toThrow();
  });
});
