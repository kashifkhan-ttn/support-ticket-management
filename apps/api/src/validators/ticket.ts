import { Priority, TicketStatus } from '@prisma/client';
import { z } from 'zod';

export const listTicketsQuerySchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(TicketStatus).optional(),
});

export const createTicketSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required'),
  priority: z.nativeEnum(Priority, { errorMap: () => ({ message: 'Invalid priority' }) }),
  assignedToId: z.string().cuid().optional().nullable(),
  createdById: z.string().cuid().optional(),
});

export const updateTicketSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200).optional(),
  description: z.string().min(1, 'Description is required').optional(),
  priority: z.nativeEnum(Priority).optional(),
  assignedToId: z.string().cuid().nullable().optional(),
});

export const updateStatusSchema = z.object({
  status: z.nativeEnum(TicketStatus, { errorMap: () => ({ message: 'Invalid status' }) }),
});

export const createCommentSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  createdById: z.string().cuid().optional(),
});

export const ticketIdParamSchema = z.object({
  id: z.string().cuid('Invalid ticket id'),
});
