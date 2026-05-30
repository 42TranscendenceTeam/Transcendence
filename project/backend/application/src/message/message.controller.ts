import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { AppError } from '../utils/AppError.js';
import { emitWithRetries } from '../utils/WebSocketUtils.js';
import { getIO } from '../server.js';
import { getSentMessages, getReceivedMessages, getAllMessages, sendMessage, updateReadStatus, deleteMessage } from './message.service.js';

export const getSentMessagesController = async (req: AuthRequest, res: Response) => {
	const friendId = Number(req.params.id);
	var amount = Number(req.params.amount);

	if (amount < 0)
		throw new AppError("':amount' needs to be a positive integer.", 400);
	else if (amount == 0)
		amount = 1000;

	if (!friendId || Number.isNaN(friendId))
		throw new AppError("Mandatory valid receiver ID.", 400);

	const messagesSentList = await getSentMessages(req.user!.id, friendId, amount);

	return res.json(messagesSentList);
};

export const getReceivedMessagesController = async (req: AuthRequest, res: Response) => {
	const friendId = Number(req.params.id);
	var amount = Number(req.params.amount);

	if (amount < 0)
		throw new AppError("':amount' needs to be a positive integer.", 400);
	else if (amount == 0)
		amount = 1000;

	if (!friendId || Number.isNaN(friendId))
		throw new AppError("Mandatory valid receiver ID.", 400);

	const messagesReceivedList = await getReceivedMessages(req.user!.id, friendId, amount);

	return res.json(messagesReceivedList);
};

export const getAllMessagesController = async (req: AuthRequest, res: Response) => {
	const friendId = Number(req.params.id);
	var amount = Number(req.params.amount);

	if (amount < 0)
		throw new AppError("':amount' needs to be a positive integer.", 400);
	else if (amount == 0)
		amount = 1000;

	if (!friendId || Number.isNaN(friendId))
		throw new AppError("Mandatory valid receiver ID.", 400);

	const messagesList = await getAllMessages(req.user!.id, friendId, amount);

	return res.json(messagesList);
};

export const sendMessageController = async (req: AuthRequest, res: Response) => {
	const friendId = Number(req.params.id);
	const { content } = req.body;

	if (!friendId || Number.isNaN(Number(friendId)))
		throw new AppError("Mandatory valid receiver ID.", 400);

	if (!content)
		throw new AppError("Message contents cannot be empty", 400);

	const request = await sendMessage(req.user!.id, friendId, content);

	var chatId = "";

	if (req.user!.id <= friendId) {
		chatId = String(req.user!.id) + String(friendId);
	} else {
		chatId =  friendId + String(req.user!.id);
	}

	res.status(201).json(request);

	emitWithRetries(getIO(), 'chat message', chatId, content).catch(() => {});

};

export const updateReadStatusController = async (req: AuthRequest, res: Response) => {
	const friendId = Number(req.params.id);

	if (Number.isNaN(friendId))
		throw new AppError("Mandatory valid friend ID.", 400);

	const request = await updateReadStatus(req.user!.id, friendId);

	return res.status(201).json(request);
};

// NOTE: Not sure if delete should also communicate with websockets
// TODO: Check if deleting messages is allowed
export const deleteMessageController = async (req: AuthRequest, res: Response) => {
	const messageId = Number(req.params.message_id);

	if (Number.isNaN(messageId))
		throw new AppError("Mandatory valid message ID.", 400);

	const message = await deleteMessage(messageId);

	return res.status(200).json(message);
};
