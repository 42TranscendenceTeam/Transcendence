import type { Request, Response } from 'express';
import { register, login, verify2FA, checkEmail, googleLogin, verifyEmail } from './auth.service.js';

export const registerUser = async (req: Request, res: Response) => {
  const result = await register(req.body);
  res.status(201).json(result);
};

export const loginUser = async (req: Request, res: Response) => {
  const result = await login(req.body);
  res.json(result);
};

export const verify2FAController = async (req: Request, res: Response) => {
  const { temp_token, code } = req.body;

  const result = await verify2FA(temp_token, code);
  res.json(result);
};

export const verifyEmailController = async (req: Request, res: Response) => {
  const { temp_token, code } = req.body;

  const result = await verifyEmail(temp_token, code);
  res.json(result);
}

export const checkEmailController = async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await checkEmail(email);
  res.json(result);
};

export const googleLoginController = async (req: Request, res: Response) => {
  const result = await googleLogin(req.body.credential);
  return res.json(result);
};
