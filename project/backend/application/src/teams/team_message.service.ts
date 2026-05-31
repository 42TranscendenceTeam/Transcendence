import { AppError } from '../utils/AppError.js';
import { prisma } from '../prisma.js';

// Returns messages sent to a team
export const getTeamSentMessages = async (userId: number, teamId: number, amount: number) => {
	const messages = await prisma.teamMessage.findMany({
		take: amount,
		where: {
			AND: [
				{ sender_id: userId },
				{ team_id: teamId },
			]
		},

		select: {
			id: true,
			content: true,
			sent_at: true
		},
		orderBy: {
			sent_at: 'desc',
		},
	});

	if (!messages)
		throw new AppError("No messages sent to team " + teamId + ".", 404);

	const message_list = messages.map((directMessage) => ({
		id: directMessage.id,
		content: directMessage.content,
		sent_at: directMessage.sent_at,
	}));

	return {
		message_list,
	}

};

// Returns messages received from a team
export const getTeamReceivedMessages = async (userId: number, teamId: number, amount: number) => {
	const messages = await prisma.teamMessage.findMany({
		take: amount,
		where: {
			NOT: [
				{sender_id: userId},
			],

			team_id: teamId,
		},

		select: {
			id: true,
			sender_id: true,
			content: true,
			sent_at: true
		},
		orderBy: {
			sent_at: 'desc',
		},
	});

	if (!messages)
		throw new AppError("No messages received from team " + teamId + ".", 404);

	const message_list = messages.map((directMessage) => ({
		id: directMessage.id,
		sender_id: directMessage.sender_id,
		content: directMessage.content,
		sent_at: directMessage.sent_at,
	}));

	return {
		message_list,
	}
};

// Returns messages sent and received to and from a team
export const getAllMessages = async (teamId: number, amount: number) => {
	const messages = await prisma.teamMessage.findMany({
		take: amount,
		where: {
				team_id: teamId,
		},

		select: {
			id: true,
			sender_id: true,
			content: true,
			sent_at: true
		},
		orderBy: {
			sent_at: 'desc',
		},
	});

	if (!messages)
		throw new AppError("No messages sent to team " + teamId + ".", 404);

	const message_list = messages.map((directMessage) => ({
		id: directMessage.id,
		sender_id: directMessage.sender_id,
		content: directMessage.content,
		sent_at: directMessage.sent_at,
	}));

	return {
		message_list,
	}
};

// Sends a message to a team
export const sendTeamMessage = async (userId: number, teamId: number, message: string) => {

	const receiver = await prisma.team.findUnique({
		where: {
			id: teamId,
		},
	});

	if (!receiver)
		throw new AppError("That team does not exist.", 404);

	const alreadyOnTeam = await prisma.teamUser.findFirst({
		where: {
			user_id: userId,
			team_id: teamId,
		},
	});

	if (!alreadyOnTeam)
		throw new AppError("You are not in team " + teamId + ".", 400);

	if (!message)
		throw new AppError("Message cannot be empty.", 400);

	return prisma.teamMessage.create({
		data: {
			sender_id: userId,
			team_id: teamId,
			content: message,
		},
	});
};

// Delete team message
export const deleteTeamMessage = async (userId: number, messageId: number) => {

	const message = await prisma.teamMessage.findFirst({
		where: {
			id: messageId,
		},
		select: {
			sender_id: true,
		},
	});

	if (!message)
		throw new AppError("Team message not found.", 404);

	if (message.sender_id != userId)
		throw new AppError("Cannot delete other people's messages", 400);

	return prisma.teamMessage.delete({
		where: {
			id: messageId,
		},
	});
};
