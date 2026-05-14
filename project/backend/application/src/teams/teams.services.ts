import { AppError } from '../utils/AppError.js';
import { prisma } from '../prisma.js';
import type { } from './teams.types.js';

// Return all teams info
export const getTeamsList = async () => {

	return prisma.team.findMany({
		select: {
			id: true,
			name: true,
			about: true,
			tags: true,
			created_at: true,
		},
	});
};