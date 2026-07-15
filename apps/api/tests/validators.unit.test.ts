import { Priority, TicketStatus } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import {
  createCommentSchema,
  createTicketSchema,
  listTicketsQuerySchema,
  ticketIdParamSchema,
  updateStatusSchema,
  updateTicketSchema,
} from '../src/validators/ticket.js';

describe('ticket validators (unit)', () => {
  it('accepts a valid create ticket payload', () => {
    const parsed = createTicketSchema.parse({
      title: 'Cannot login',
      description: 'Details here',
      priority: Priority.HIGH,
    });
    expect(parsed.title).toBe('Cannot login');
  });

  it('rejects empty title on create', () => {
    const result = createTicketSchema.safeParse({
      title: '',
      description: 'x',
      priority: Priority.LOW,
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing description on create', () => {
    const result = createTicketSchema.safeParse({
      title: 'Title only',
      priority: Priority.LOW,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid priority', () => {
    const result = createTicketSchema.safeParse({
      title: 'T',
      description: 'D',
      priority: 'CRITICAL',
    });
    expect(result.success).toBe(false);
  });

  it('parses optional list query filters', () => {
    expect(listTicketsQuerySchema.parse({}).search).toBeUndefined();
    expect(listTicketsQuerySchema.parse({ status: TicketStatus.OPEN }).status).toBe(
      TicketStatus.OPEN,
    );
  });

  it('rejects invalid status query filter', () => {
    const result = listTicketsQuerySchema.safeParse({ status: 'DONE' });
    expect(result.success).toBe(false);
  });

  it('requires non-empty comment message', () => {
    expect(createCommentSchema.safeParse({ message: '' }).success).toBe(false);
    expect(createCommentSchema.parse({ message: 'Looking into it' }).message).toBe(
      'Looking into it',
    );
  });

  it('validates status update enum only (transition rules are separate)', () => {
    expect(updateStatusSchema.parse({ status: TicketStatus.IN_PROGRESS }).status).toBe(
      TicketStatus.IN_PROGRESS,
    );
    expect(updateStatusSchema.safeParse({ status: 'NOPE' }).success).toBe(false);
  });

  it('allows partial ticket updates', () => {
    const parsed = updateTicketSchema.parse({ title: 'Updated' });
    expect(parsed.title).toBe('Updated');
    expect(parsed.description).toBeUndefined();
  });

  it('rejects invalid ticket id format', () => {
    expect(ticketIdParamSchema.safeParse({ id: 'not-a-cuid' }).success).toBe(false);
  });
});
