import { TicketStatus } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';
import {
  assertValidTransition,
  StatusTransitionError,
} from '../state-machine/ticket-status.js';

const userSelect = { id: true, name: true, email: true, role: true };

const ticketInclude = {
  createdBy: { select: userSelect },
  assignedTo: { select: userSelect },
  comments: {
    orderBy: { createdAt: 'asc' as const },
    include: { createdBy: { select: userSelect } },
  },
};

export async function getDefaultUserId() {
  const user = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
  if (!user) {
    throw new AppError(500, 'No users found. Run database seed.');
  }
  return user.id;
}

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: { name: 'asc' },
    select: userSelect,
  });
}

export async function listTickets(search?: string, status?: TicketStatus) {
  const where: {
    status?: TicketStatus;
    OR?: Array<{ title: { contains: string; mode: 'insensitive' } } | { description: { contains: string; mode: 'insensitive' } }>;
  } = {};

  if (status) {
    where.status = status;
  }

  if (search?.trim()) {
    const term = search.trim();
    where.OR = [
      { title: { contains: term, mode: 'insensitive' } },
      { description: { contains: term, mode: 'insensitive' } },
    ];
  }

  return prisma.ticket.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: {
      createdBy: { select: userSelect },
      assignedTo: { select: userSelect },
      _count: { select: { comments: true } },
    },
  });
}

export async function getTicketById(id: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: ticketInclude,
  });

  if (!ticket) {
    throw new AppError(404, 'Ticket not found');
  }

  return ticket;
}

export async function createTicket(data: {
  title: string;
  description: string;
  priority: import('@prisma/client').Priority;
  assignedToId?: string | null;
  createdById: string;
}) {
  if (data.assignedToId) {
    await assertUserExists(data.assignedToId, 'assignedToId');
  }

  await assertUserExists(data.createdById, 'createdById');

  return prisma.ticket.create({
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority,
      assignedToId: data.assignedToId ?? null,
      createdById: data.createdById,
    },
    include: ticketInclude,
  });
}

export async function updateTicket(
  id: string,
  data: {
    title?: string;
    description?: string;
    priority?: import('@prisma/client').Priority;
    assignedToId?: string | null;
  },
) {
  await getTicketById(id);

  if (data.assignedToId) {
    await assertUserExists(data.assignedToId, 'assignedToId');
  }

  return prisma.ticket.update({
    where: { id },
    data,
    include: ticketInclude,
  });
}

export async function updateTicketStatus(id: string, status: TicketStatus) {
  const ticket = await getTicketById(id);

  try {
    assertValidTransition(ticket.status, status);
  } catch (error) {
    if (error instanceof StatusTransitionError) {
      throw new AppError(422, error.message, [
        { field: 'status', message: error.message },
      ]);
    }
    throw error;
  }

  return prisma.ticket.update({
    where: { id },
    data: { status },
    include: ticketInclude,
  });
}

export async function addComment(
  ticketId: string,
  message: string,
  createdById: string,
) {
  await getTicketById(ticketId);
  await assertUserExists(createdById, 'createdById');

  return prisma.comment.create({
    data: { ticketId, message, createdById },
    include: { createdBy: { select: userSelect } },
  });
}

async function assertUserExists(userId: string, field: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(400, 'User not found', [{ field, message: 'User does not exist' }]);
  }
}
