import type { Request, Response } from 'express';
import { getMe, updateMe, searchUsers, getUserById, getUserState, toggle2FA } from './users.service.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import type { UpdateUserDTO } from './users.types.js';

export const getMeController = async (req: AuthRequest, res: Response) => {
  const user = await getMe(req.user!.id);
  return res.json(user);
};

export const updateMeController = async (req: AuthRequest, res: Response) => {
  const { username, bio } = req.body;
  const data: UpdateUserDTO = { username, bio };

  if (req.file) {
    data.avatar_url = `/api/uploads/avatars/${req.file.filename}`;
  }

  const updated = await updateMe(req.user!.id, data);

  return res.json(updated);
};

export const searchUsersController = async (req: AuthRequest, res: Response) => {
  const q = req.query.q as string;

  const users = await searchUsers(q);

  return res.json(users);
};

export const getUserByIdController = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const user = await getUserById(id);

  return res.json(user);
};

export const toggle2FAController = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const result = await toggle2FA(userId);

  return res.json(result);
}

export const getUserStateController = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const user = await getUserState(id);

  return res.json(user);
};
