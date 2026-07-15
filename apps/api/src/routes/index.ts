import { Router } from 'express';
import { asyncHandler } from '../middleware/error-handler.js';
import {
  addComment,
  createTicket,
  getDefaultUserId,
  getTicketById,
  listTickets,
  listUsers,
  updateTicket,
  updateTicketStatus,
} from '../services/ticket.service.js';
import {
  createCommentSchema,
  createTicketSchema,
  listTicketsQuerySchema,
  ticketIdParamSchema,
  updateStatusSchema,
  updateTicketSchema,
} from '../validators/ticket.js';

export const ticketsRouter = Router();

ticketsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const query = listTicketsQuerySchema.parse(req.query);
    const tickets = await listTickets(query.search, query.status);
    res.json(tickets);
  }),
);

ticketsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = createTicketSchema.parse(req.body);
    const createdById = body.createdById ?? (await getDefaultUserId());
    const ticket = await createTicket({ ...body, createdById });
    res.status(201).json(ticket);
  }),
);

ticketsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = ticketIdParamSchema.parse(req.params);
    const ticket = await getTicketById(id);
    res.json(ticket);
  }),
);

ticketsRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = ticketIdParamSchema.parse(req.params);
    const body = updateTicketSchema.parse(req.body);
    const ticket = await updateTicket(id, body);
    res.json(ticket);
  }),
);

ticketsRouter.patch(
  '/:id/status',
  asyncHandler(async (req, res) => {
    const { id } = ticketIdParamSchema.parse(req.params);
    const { status } = updateStatusSchema.parse(req.body);
    const ticket = await updateTicketStatus(id, status);
    res.json(ticket);
  }),
);

ticketsRouter.post(
  '/:id/comments',
  asyncHandler(async (req, res) => {
    const { id } = ticketIdParamSchema.parse(req.params);
    const body = createCommentSchema.parse(req.body);
    const createdById = body.createdById ?? (await getDefaultUserId());
    const comment = await addComment(id, body.message, createdById);
    res.status(201).json(comment);
  }),
);

export const usersRouter = Router();

usersRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const users = await listUsers();
    res.json(users);
  }),
);
