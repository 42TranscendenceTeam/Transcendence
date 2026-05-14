import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { AppError } from '../utils/AppError.js';
import { getTeamsList, createTeam } from './teams.services.js';

export const getTeamsListController = async (req: AuthRequest, res: Response) => {
	const teamList = await getTeamsList();
	return res.json(teamList);
};

export const createTeamController = async (req: AuthRequest, res: Response) => {
	const { name, max_users, about, tags } = req.body;

	if (!name || Number.isNaN(Number(max_users)))
		throw new AppError("Team name and valid max users are required.", 400);

	const team = await createTeam(req.user!.id, { name, max_users: Number(max_users), about, tags });

	return res.status(201).json(team);
};