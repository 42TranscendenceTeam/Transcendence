import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { getFriends } from './friends.service.js';

export const getFriendsController = async (req: AuthRequest, res: Response) => {
	const friendList = await getFriends(req.user!.id);
	return res.json(friendList);
};