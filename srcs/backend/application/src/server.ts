import './config.js';

import express from 'express';
import type { Request, Response } from 'express';
import authRoutes from './auth/auth.routes.js';

const app = express();
const PORT = 5000;

app.use(express.json());
app.use('/auth', authRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
