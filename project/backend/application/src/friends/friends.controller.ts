import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { AppError } from '../utils/AppError.js';
import { getFriends, getSentFriendRequests, getReceivedFriendRequests, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, deleteFriend, cancelFriendRequest } from './friends.service.js';

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

	if (!receiverId || Number.isNaN(Number(receiverId)))
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

export const rejectFriendRequestController = async (req: AuthRequest, res: Response) => {
	const requestId = Number(req.params.id);

	if (Number.isNaN(requestId))
		throw new AppError("Mandatory valid request ID.", 400);

	const request = await rejectFriendRequest(req.user!.id, requestId);

	return res.status(200).json(request);
};

export const cancelFriendRequestController = async (req: AuthRequest, res: Response) => {
	const requestId = Number(req.params.id);

	if (Number.isNaN(requestId))
		throw new AppError("Mandatory valid request ID.", 400);

	const request = await cancelFriendRequest(req.user!.id, requestId);

	return res.status(200).json(request);
};

export const deleteFriendController = async (req: AuthRequest, res: Response) => {
	const friendId = Number(req.params.id);

	if (Number.isNaN(friendId))
		throw new AppError("Mandatory valid friend ID.", 400);

	const friendship = await deleteFriend(req.user!.id, friendId);

	return res.status(200).json(friendship);
};
