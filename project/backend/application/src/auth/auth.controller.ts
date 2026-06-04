import type { Request, Response } from 'express';
import { register, login, checkEmail } from './auth.service.js';

export const registerUser = async (req: Request, res: Response) => {
  const result = await register(req.body);
  res.status(201).json(result);
};

export const loginUser = async (req: Request, res: Response) => {
  const result = await login(req.body);
  res.json(result);
};

export const checkEmailController = async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await checkEmail(email);
  res.json(result);
};
