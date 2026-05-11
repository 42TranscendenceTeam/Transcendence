import { prisma } from '../prisma.js';
import { AppError } from '../utils/AppError.js';
import type { } from './friends.types.js';

// Returns friends list of logged-in user
export const getFriends = async (userId: number) => {

	const friendList = await prisma.friendship.findMany({
		where: {
			OR: [
				{ user_id_first: userId },
				{ user_id_second: userId },
			],
		},

		include: {
			user_first: {
				select: {
					id: true,
					username: true,
					avatar_url: true,
				},
			},
			user_second: {
				select: {
					id: true,
					username: true,
					avatar_url: true,
				},
			},
		},
	});

	return friendList.map((friendship) => {

		const friend = friendship.user_id_first === userId ? friendship.user_second : friendship.user_first;

		return {
			...friend,
			friends_since: friendship.friends_since,
		};
	});
};

// Returns friend requests SENT from the user
export const getSentFriendRequests = async (userId: number) => {

	const requests = await prisma.friendRequest.findMany({
		where: {
			sender_id: userId,
			status: 'pending',
		},

		include: {
			receiver: {
				select: {
					id: true,
					username: true,
					avatar_url: true,
				},
			},
		},
	});

	return requests.map((request) => ({
		request_id: request.id,
		status: request.status,
		sent_at: request.sent_at,
		user: request.receiver,
	}));
};

// Returns friend requests RECEIVED from the user
export const getReceivedFriendRequests = async (userId: number) => {

	const requests = await prisma.friendRequest.findMany({
		where: {
			receiver_id: userId,
			status: 'pending',
		},

		include: {
			sender: {
				select: {
					id: true,
					username: true,
					avatar_url: true,
				},
			},
		},
	});

	return requests.map((request) => ({
		request_id: request.id,
		status: request.status,
		sent_at: request.sent_at,
		user: request.sender,
	}));
};