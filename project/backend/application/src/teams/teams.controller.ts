import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { AppError } from '../utils/AppError.js';
import { getTeamsList } from './teams.services.js';

export const getTeamsListController = async (req: AuthRequest, res: Response) => {
	const teamList = await getTeamsList();
	return res.json(teamList);
};