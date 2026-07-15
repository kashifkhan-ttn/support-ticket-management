import { createApp } from './app.js';

const PORT = Number(process.env.PORT) || 3001;

const app = createApp();

const server = app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the other process or set PORT in .env`);
    process.exit(1);
  }
  throw err;
});
