import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { AppError } from '../utils/AppError.js';
import { getTeamSentMessages, getTeamReceivedMessages, getAllMessages, sendTeamMessage, deleteTeamMessage } from './team_message.service.js';

export const getTeamSentMessagesController = async (req: AuthRequest, res: Response) => {
	const teamId = Number(req.params.team_id);

	if (!teamId || Number.isNaN(teamId))
		throw new AppError("Mandatory valid team ID.", 400);

	const messagesSentList = await getTeamSentMessages(req.user!.id, teamId);

	return res.json(messagesSentList);
};

export const getTeamReceivedMessagesController = async (req: AuthRequest, res: Response) => {
	const teamId = Number(req.params.team_id);

	if (!teamId || Number.isNaN(teamId))
		throw new AppError("Mandatory valid team ID.", 400);

	const messagesReceivedList = await getTeamReceivedMessages(req.user!.id, teamId);

	return res.json(messagesReceivedList);
};

export const getAllMessagesController = async (req: AuthRequest, res: Response) => {
	const teamId = Number(req.params.team_id);

	if (!teamId || Number.isNaN(teamId))
		throw new AppError("Mandatory valid team ID.", 400);

	const messagesList = await getAllMessages(req.user!.id, teamId);

	return res.json(messagesList);
};

export const sendTeamMessageController = async (req: AuthRequest, res: Response) => {
	const { teamId, content } = req.body;

	if (!teamId || Number.isNaN(Number(teamId)))
		throw new AppError("Mandatory valid team ID.", 400);

	if (!content)
		throw new AppError("Message contents cannot be empty", 400);

	const request = await sendTeamMessage(req.user!.id, Number(teamId), content);

	return res.status(201).json(request);
};

export const deleteTeamMessageController = async (req: AuthRequest, res: Response) => {
	const messageId = Number(req.params.id);

	if (Number.isNaN(messageId))
		throw new AppError("Mandatory valid message ID.", 400);

	const message = await deleteTeamMessage(messageId);

	return res.status(200).json(message);
};
