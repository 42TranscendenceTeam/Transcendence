import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { getFriends, getSentFriendRequests, getReceivedFriendRequests } from './friends.service.js';

export const getFriendsController = async (req: AuthRequest, res: Response) => {
	const friendList = await getFriends(req.user!.id);
	return res.json(friendList);
};

export const getSentFriendRequestsController = async (req: AuthRequest, res: Response) => {
	const requests = await getSentFriendRequests(req.user!.id);
	return res.json(requests);
};

export const getReceivedFriendRequestsController = async (req: AuthRequest, res: Response) => {
	const requests = await getReceivedFriendRequests(req.user!.id);
	return res.json(requests);
};