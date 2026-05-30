import { AppError } from '../utils/AppError.js';
import { prisma } from '../prisma.js';

// Returns messages sent to a friend
export const getSentMessages = async (userId: number, friendId: number, amount: number) => {
	const messages = await prisma.directMessage.findMany({
		take: amount,
		where: {
			AND: [
				{ sender_id: userId },
				{ receiver_id: friendId },
			]
		},
		select: {
			id: true,
			content: true,
			status_read: true,
			sent_at: true
		},
		orderBy: {
			sent_at: 'desc',
		},
	});

	if (!messages)
		throw new AppError("No messages sent to user " + friendId + ".", 404);

	const message_list = messages.map((directMessage) => ({
		id: directMessage.id,
		content: directMessage.content,
		status_read: directMessage.status_read,
		sent_at: directMessage.sent_at,
	}));

	return {
		message_list,
	}

};

// Returns messages received from a friend
export const getReceivedMessages = async (userId: number, friendId: number, amount: number) => {
	const messages = await prisma.directMessage.findMany({
		take: amount,
		where: {
				receiver_id: userId,
				sender_id: friendId,
		},
		select: {
			id: true,
			content: true,
			status_read: true,
			sent_at: true
		},
		orderBy: { 
			sent_at: 'desc'
		},
	});

	if (!messages)
		throw new AppError("No messages received from user " + friendId + ".", 404);

	const message_list = messages.map((directMessage) => ({
		id: directMessage.id,
		content: directMessage.content,
		status_read: directMessage.status_read,
		sent_at: directMessage.sent_at,
	}));

	return {
		message_list,
	}

};

// Returns messages sent and received to and from a friend
export const getAllMessages = async (userId: number, friendId: number, amount: number) => {
	const messages = await prisma.directMessage.findMany({
		take: amount,
		where: {
			OR: [
				{ receiver_id: userId, sender_id: friendId },
				{ sender_id: userId, receiver_id: friendId },
			]
		},
		select: {
			id: true,
			content: true,
			status_read: true,
			sent_at: true
		},
		orderBy: { 
			sent_at: 'desc'
		},
	});

	if (!messages)
		throw new AppError("No messages sent to user " + friendId + ".", 404);

	const message_list = messages.map((directMessage) => ({
		id: directMessage.id,
		content: directMessage.content,
		status_read: directMessage.status_read,
		sent_at: directMessage.sent_at,
	}));

	return {
		message_list,
	}

};

// Sends a message to a friend
export const sendMessage = async (userId: number, friendId: number, message: string) => {

	// NOTE: Uncomment this if messages to yourself are not allowed
	// if (userId === friendId)
	// 	throw new AppError("Can't send a friend request to yourself.", 400);

	const receiver = await prisma.user.findUnique({
		where: {
			id: friendId,
		},
	});

	if (!receiver)
		throw new AppError("That user does not exist.", 404);

	const alreadyFriends = await prisma.friendship.findFirst({
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

	if (!alreadyFriends)
		throw new AppError("You are not friends.", 400);

	if (!message)
		throw new AppError("Message cannot be empty.", 400);

	return prisma.directMessage.create({
		data: {
			sender_id: userId,
			receiver_id: friendId,
			content: message,
			status_read: false,
		},
	});
};

// Update read status
export const updateReadStatus = async (userId: number, friendId: number) => {

	const unreadMessages = await prisma.directMessage.findMany({
		where: {
			AND: [
				{ sender_id: friendId },
				{ receiver_id: userId },
				{ status_read: false },
			]
		},
		select: {
			id: true,
		}
	})

	if (!unreadMessages)
		return ;

	// TODO: Maybe change notification state here

	// NOTE: This might be slow. If it gives any problems we might need to find a different solution
	// This was the easiest option to implement
	const promises = unreadMessages.map(({id}) => prisma.directMessage.update({
		where: {
			id: id
		},
		data: {
			status_read: true
		}
	}));

	return await Promise.all(promises);
}

// Delete message
export const deleteMessage = async (messageId: number) => {

	const message = await prisma.directMessage.findFirst({
		where: {
			id: messageId,
		},
	});

	if (!message)
		throw new AppError("Direct message not found.", 404);

	return prisma.directMessage.delete({
		where: {
			id: messageId,
		},
	});
};
