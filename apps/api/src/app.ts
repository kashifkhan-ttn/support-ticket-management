import cors from 'cors';
import express from 'express';
import { errorHandler } from './middleware/error-handler.js';
import { ticketsRouter, usersRouter } from './routes/index.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/tickets', ticketsRouter);
  app.use('/api/users', usersRouter);

  app.use(errorHandler);

  return app;
}
