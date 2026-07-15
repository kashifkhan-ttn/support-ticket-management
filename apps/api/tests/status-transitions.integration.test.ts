import { Priority, TicketStatus } from '@prisma/client';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';

const app = createApp();

const TEST_TICKET_TITLES = [
  'Open ticket',
  'In progress ticket',
  'Resolved ticket',
  'Closed ticket',
  'Cancelled ticket',
];

describe('Ticket status state machine', () => {
  let userId: string;
  let openTicketId: string;
  let inProgressTicketId: string;
  let resolvedTicketId: string;
  let closedTicketId: string;
  let cancelledTicketId: string;

  beforeAll(async () => {
    const user = await prisma.user.findFirst();
    if (!user) throw new Error('Seed users required for tests');
    userId = user.id;
  });

  beforeEach(async () => {
    await prisma.comment.deleteMany({
      where: { ticket: { title: { in: TEST_TICKET_TITLES } } },
    });
    await prisma.ticket.deleteMany({
      where: { title: { in: TEST_TICKET_TITLES } },
    });

    const open = await prisma.ticket.create({
      data: {
        title: 'Open ticket',
        description: 'Test open',
        priority: Priority.MEDIUM,
        status: TicketStatus.OPEN,
        createdById: userId,
      },
    });
    openTicketId = open.id;

    const inProgress = await prisma.ticket.create({
      data: {
        title: 'In progress ticket',
        description: 'Test in progress',
        priority: Priority.MEDIUM,
        status: TicketStatus.IN_PROGRESS,
        createdById: userId,
      },
    });
    inProgressTicketId = inProgress.id;

    const resolved = await prisma.ticket.create({
      data: {
        title: 'Resolved ticket',
        description: 'Test resolved',
        priority: Priority.MEDIUM,
        status: TicketStatus.RESOLVED,
        createdById: userId,
      },
    });
    resolvedTicketId = resolved.id;

    const closed = await prisma.ticket.create({
      data: {
        title: 'Closed ticket',
        description: 'Test closed',
        priority: Priority.MEDIUM,
        status: TicketStatus.CLOSED,
        createdById: userId,
      },
    });
    closedTicketId = closed.id;

    const cancelled = await prisma.ticket.create({
      data: {
        title: 'Cancelled ticket',
        description: 'Test cancelled',
        priority: Priority.MEDIUM,
        status: TicketStatus.CANCELLED,
        createdById: userId,
      },
    });
    cancelledTicketId = cancelled.id;
  });

  afterAll(async () => {
    await prisma.comment.deleteMany({
      where: { ticket: { title: { in: TEST_TICKET_TITLES } } },
    });
    await prisma.ticket.deleteMany({
      where: { title: { in: TEST_TICKET_TITLES } },
    });
  });

  describe('valid transitions', () => {
    it('OPEN -> IN_PROGRESS', async () => {
      const res = await request(app)
        .patch(`/api/tickets/${openTicketId}/status`)
        .send({ status: TicketStatus.IN_PROGRESS });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(TicketStatus.IN_PROGRESS);
    });

    it('OPEN -> CANCELLED', async () => {
      const res = await request(app)
        .patch(`/api/tickets/${openTicketId}/status`)
        .send({ status: TicketStatus.CANCELLED });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(TicketStatus.CANCELLED);
    });

    it('IN_PROGRESS -> RESOLVED', async () => {
      const res = await request(app)
        .patch(`/api/tickets/${inProgressTicketId}/status`)
        .send({ status: TicketStatus.RESOLVED });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(TicketStatus.RESOLVED);
    });

    it('IN_PROGRESS -> CANCELLED', async () => {
      const res = await request(app)
        .patch(`/api/tickets/${inProgressTicketId}/status`)
        .send({ status: TicketStatus.CANCELLED });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(TicketStatus.CANCELLED);
    });

    it('RESOLVED -> CLOSED', async () => {
      const res = await request(app)
        .patch(`/api/tickets/${resolvedTicketId}/status`)
        .send({ status: TicketStatus.CLOSED });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(TicketStatus.CLOSED);
    });
  });

  describe('invalid transitions', () => {
    it('OPEN -> RESOLVED is rejected', async () => {
      const res = await request(app)
        .patch(`/api/tickets/${openTicketId}/status`)
        .send({ status: TicketStatus.RESOLVED });

      expect(res.status).toBe(422);
      expect(res.body.errors[0].field).toBe('status');
    });

    it('OPEN -> CLOSED is rejected', async () => {
      const res = await request(app)
        .patch(`/api/tickets/${openTicketId}/status`)
        .send({ status: TicketStatus.CLOSED });

      expect(res.status).toBe(422);
    });

    it('IN_PROGRESS -> OPEN is rejected', async () => {
      const res = await request(app)
        .patch(`/api/tickets/${inProgressTicketId}/status`)
        .send({ status: TicketStatus.OPEN });

      expect(res.status).toBe(422);
    });

    it('RESOLVED -> IN_PROGRESS is rejected', async () => {
      const res = await request(app)
        .patch(`/api/tickets/${resolvedTicketId}/status`)
        .send({ status: TicketStatus.IN_PROGRESS });

      expect(res.status).toBe(422);
    });

    it('RESOLVED -> CANCELLED is rejected', async () => {
      const res = await request(app)
        .patch(`/api/tickets/${resolvedTicketId}/status`)
        .send({ status: TicketStatus.CANCELLED });

      expect(res.status).toBe(422);
    });

    it('CLOSED -> OPEN is rejected', async () => {
      const res = await request(app)
        .patch(`/api/tickets/${closedTicketId}/status`)
        .send({ status: TicketStatus.OPEN });

      expect(res.status).toBe(422);
    });

    it('CANCELLED -> IN_PROGRESS is rejected', async () => {
      const res = await request(app)
        .patch(`/api/tickets/${cancelledTicketId}/status`)
        .send({ status: TicketStatus.IN_PROGRESS });

      expect(res.status).toBe(422);
    });
  });
});

describe('Ticket API validation', () => {
  it('rejects create without required fields', async () => {
    const res = await request(app).post('/api/tickets').send({ title: '' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('returns 404 for unknown ticket with valid id format', async () => {
    const res = await request(app).get('/api/tickets/clxxxxxxxxxxxxxxxxxxxxxxxxx');

    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid ticket id format', async () => {
    const res = await request(app).get('/api/tickets/not-a-valid-id');

    expect(res.status).toBe(400);
  });
});
