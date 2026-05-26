import { AppError } from '../utils/AppError.js';
import { prisma } from '../prisma.js';
import { createNotification } from '../notifications/notifications.service.js';

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

// Sends a friend request
export const sendFriendRequest = async (userId: number, receiverId: number) => {

	if (userId === receiverId)
		throw new AppError("Can't send a friend request to yourself.", 400);

	const receiver = await prisma.user.findUnique({
		where: {
			id: receiverId,
		},
		select: {
			username: true,
		}
	});

	if (!receiver)
		throw new AppError("That user does not exist.", 404);

	const alreadyFriends = await prisma.friendship.findFirst({
		where: {
			OR: [
				{
					user_id_first: userId,
					user_id_second: receiverId,
				},
				{
					user_id_first: receiverId,
					user_id_second: userId,
				},
			],
		},
	});

	if (alreadyFriends)
		throw new AppError("You are already friends.", 400);

	const requestExists = await prisma.friendRequest.findFirst({
		where: {
			status: 'pending',
			OR: [
				{
					sender_id: userId,
					receiver_id: receiverId,
				},
				{
					sender_id: receiverId,
					receiver_id: userId,
				},
			],
		},
	});

	if (requestExists)
		throw new AppError("Friend request already exists.", 400);

	const request = await prisma.friendRequest.create({
		data: {
			sender_id: userId,
			receiver_id: receiverId,
		},
	});

	const sender = await prisma.user.findUnique({
		where: {
			id: userId,
		},
		select: {
			username: true,
		}
	});

	await createNotification(
		receiverId,
		'friend_request',
		request.id,
		'friend_request',
		userId,
		`You got a friend request from ${sender?.username ?? 'someone'}.`,
	);

	return request;
};

// Accept pending friend request
export const acceptFriendRequest = async (userId: number, requestId: number) => {

	const request = await prisma.friendRequest.findFirst({
		where: {
			id: requestId,
			receiver_id: userId,
			status: 'pending',
		},
	});

	if (!request)
		throw new AppError("Friend request not found.", 404);

	const friendship = await prisma.friendship.create({
		data: {
			user_id_first: request.sender_id,
			user_id_second: userId,
		},
	});

	await prisma.friendRequest.update({
		where: {
			id: request.id,
		},
		data: {
			status: 'accepted',
		}
	});

	const receiver = await prisma.user.findUnique({
		where: {
			id: userId,
		},
		select: {
			username: true,
		},
	});

	await createNotification(
		request.sender_id,
		'friend_request_accepted',
		request.id,
		'friend_request',
		request.receiver_id,
		`${receiver?.username ?? 'Someone'} accepted your friend request.`,
	);

	return friendship;
};

// Decline pending friend request
export const rejectFriendRequest = async (userId: number, requestId: number) => {

	const request = await prisma.friendRequest.findFirst({
		where: {
			id: requestId,
			receiver_id: userId,
			status: 'pending',
		},
	});

	if (!request)
		throw new AppError("Friend request not found.", 404);

	const reject = await prisma.friendRequest.update({
		where: {
			id: request.id,
		},
		data: {
			status: 'rejected',
		},
	});

	const receiver = await prisma.user.findUnique({
		where: {
			id: userId,
		},
		select: {
			username: true,
		},
	});

	await createNotification(
		request.sender_id,
		'friend_request_rejected',
		request.id,
		'friend_request',
		request.receiver_id,
		`${receiver?.username ?? 'Someone'} rejected your friend request.`,
	);

	return reject;
};

// Delete friend
export const deleteFriend = async (userId: number, friendId: number) => {

	const friendship = await prisma.friendship.findFirst({
		where: {
			OR: [
				{
					user_id_first: userId,
					user_id_second: friendId,
				},
				{
					user_id_first: friendId,
					user_id_second: userId,
				},
			],
		},
	});

	if (!friendship)
		throw new AppError("Friendship not found.", 404);

	const remover = await prisma.user.findUnique({
		where: {
			id: userId,
		},
		select: {
			username: true,
		},
	});

	const deleted = await prisma.friendship.delete({
		where: {
			id: friendship.id,
		},
	});

	await createNotification(
		friendId,
		'friend_removed',
		friendship.id,
		'friendship',
		userId,
		`${remover?.username ?? 'Someone'} removed you from their friends.`,
	);

	return deleted;
};
