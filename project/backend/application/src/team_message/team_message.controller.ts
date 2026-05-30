import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { AppError } from '../utils/AppError.js';
import { emitWithRetries } from '../utils/WebSocketUtils.js';
import { getIO } from '../server.js';
import { getTeamSentMessages, getTeamReceivedMessages, getAllMessages, sendTeamMessage, deleteTeamMessage } from './team_message.service.js';

export const getTeamSentMessagesController = async (req: AuthRequest, res: Response) => {
	const teamId = Number(req.params.id);
	var amount = Number(req.params.amount);

	if (amount < 0)
		throw new AppError("':amount' needs to be a positive integer.", 400);
	else if (amount == 0)
		amount = 1000;

	if (!teamId || Number.isNaN(teamId))
		throw new AppError("Mandatory valid team ID.", 400);

	const messagesSentList = await getTeamSentMessages(req.user!.id, teamId, amount);

	return res.json(messagesSentList);
};

export const getTeamReceivedMessagesController = async (req: AuthRequest, res: Response) => {
	const teamId = Number(req.params.id);
	var amount = Number(req.params.amount);

	if (amount < 0)
		throw new AppError("':amount' needs to be a positive integer.", 400);
	else if (amount == 0)
		amount = 1000;

	if (!teamId || Number.isNaN(teamId))
		throw new AppError("Mandatory valid team ID.", 400);

	const messagesReceivedList = await getTeamReceivedMessages(req.user!.id, teamId, amount);

	return res.json(messagesReceivedList);
};

export const getAllMessagesController = async (req: AuthRequest, res: Response) => {
	const teamId = Number(req.params.id);
	var amount = Number(req.params.amount);

	if (amount < 0)
		throw new AppError("':amount' needs to be a positive integer.", 400);
	else if (amount == 0)
		amount = 1000;

	if (!teamId || Number.isNaN(teamId))
		throw new AppError("Mandatory valid team ID.", 400);

	const messagesList = await getAllMessages(teamId, amount);

	return res.json(messagesList);
};

export const sendTeamMessageController = async (req: AuthRequest, res: Response) => {
	const teamId = Number(req.params.id);
	const { content } = req.body;

	if (!teamId || Number.isNaN(Number(teamId)))
		throw new AppError("Mandatory valid team ID.", 400);

	if (!content)
		throw new AppError("Message contents cannot be empty", 400);

	const request = await sendTeamMessage(req.user!.id, teamId, content);

	res.status(201).json(request);

	emitWithRetries(getIO(), 'team message', String(teamId), content).catch(() => {});

};

// NOTE: Not sure if delete should also communicate with websockets
// TODO: Check if deleting messages is allowed
export const deleteTeamMessageController = async (req: AuthRequest, res: Response) => {
	const messageId = Number(req.params.message_id);

	if (Number.isNaN(messageId))
		throw new AppError("Mandatory valid message ID.", 400);

	const message = await deleteTeamMessage(messageId);

	return res.status(200).json(message);
};
