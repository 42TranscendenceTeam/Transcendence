import type { Request, Response } from 'express';
import { register, login } from './auth.service.js';

export const registerUser = async (req: Request, res: Response) => {
  const result = await register(req.body);
  res.status(201).json(result);
};

export const loginUser = async (req: Request, res: Response) => {
  const result = await login(req.body);
  res.json(result);
};
