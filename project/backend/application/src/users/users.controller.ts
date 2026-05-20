import type { Response } from 'express';
import { getMe, updateMe, searchUsers } from './users.service.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import type { UpdateUserDTO } from './users.types.js';

export const getMeController = async (req: AuthRequest, res: Response) => {
  const user = await getMe(req.user!.id);
  return res.json(user);
};

export const updateMeController = async (req: AuthRequest, res: Response) => {
  const { username, email, bio } = req.body;
  const data: UpdateUserDTO = { username, email, bio };

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