import { AppError } from '../utils/AppError.js';
import { prisma } from '../prisma.js';
import type { CreateTeamDTO } from './teams.types.js';

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

// Create new team
export const createTeam = async (userId: number, info: CreateTeamDTO) => {

	const teamExists = await prisma.team.findUnique({
		where: {
			name: info.name,
		},
	});

	if (teamExists)
		throw new AppError("Team name already exists.", 400);

	return prisma.team.create({
		data: {
			owner_id: userId,
			name: info.name,
			max_users: info.max_users,
			about: info.about ?? null,
			tags: info.tags ?? null,
		},
	});
};