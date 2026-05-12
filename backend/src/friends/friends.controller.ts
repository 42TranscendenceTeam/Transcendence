import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { AppError } from '../utils/AppError.js';
import { getFriends, getSentFriendRequests, getReceivedFriendRequests, sendFriendRequest, acceptFriendRequest, declineFriendRequest } from './friends.service.js';

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

export const sendFriendRequestController = async (req: AuthRequest, res: Response) => {
	const { receiverId } = req.body;
	
	if (!receiverId)
		throw new AppError("Mandatory valid receiver ID.", 400);

	const request = await sendFriendRequest(req.user!.id, Number(receiverId));

	return res.status(201).json(request);
};

export const acceptFriendRequestController = async (req: AuthRequest, res: Response) => {
	const requestId = Number(req.params.id);

	if (Number.isNaN(requestId))
		throw new AppError("Mandatory valid request ID.", 400);

	const request = await acceptFriendRequest(req.user!.id, requestId);

	return res.status(201).json(request);
};

export const declineFriendRequestController = async (req: AuthRequest, res: Response) => {
	const requestId = Number(req.params.id);

	if (Number.isNaN(requestId))
		throw new AppError("Mandatory valid request ID.", 400);

	const request = await declineFriendRequest(req.user!.id, requestId);

	return res.status(201).json(request);
};