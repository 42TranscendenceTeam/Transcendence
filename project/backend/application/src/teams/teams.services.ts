import { AppError } from '../utils/AppError.js';
import { prisma } from '../prisma.js';
import type { CreateTeamDTO, UpdateTeamDTO } from './teams.types.js';

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

// Return one team info with team id
export const getTeam = async (teamId: number) => {

	const team = await prisma.team.findUnique({
		where: {
			id: teamId,
		},
		select: {
			id: true,
			name: true,
			owner_id: true,
			max_users: true,
			about: true,
			tags: true,
			status_ongoing: true,
			created_at: true,
			_count: {
				select: {
					team_users: true,
				},
			},
		},
	});

	if (!team)
		throw new AppError("Team not found.", 404);

	return {
		id: team.id,
		name: team.name,
		owner_id: team.owner_id,
		max_users: team.max_users,
		member_count: team._count.team_users,
		about: team.about,
		tags: team.tags,
		status_ongoing: team.status_ongoing,
		created_at: team.created_at,
	};
};

// Update team info with team id
export const updateTeam = async (userId: number, teamId: number, info: UpdateTeamDTO) => {

	const team = await prisma.team.findUnique({
		where: {
			id: teamId,
		},
		select: {
			owner_id: true,
		},
	});

	if (!team)
		throw new AppError("Team not found.", 404);

	if (userId !== team.owner_id)
		throw new AppError("Only the owner of the team can update it.", 403);

	return prisma.team.update({
		where: {
			id: teamId,
		},
		data: {
			name: info.name,
			about: info.about ?? null,
			tags: info.tags ?? null,
			status_ongoing: info.status_ongoing,
			edited_at: new Date(),
		},
	});
};

// Delete team with team id
export const deleteTeam = async (userId: number, teamId: number) => {

	const team = await prisma.team.findUnique({
		where: {
			id: teamId,
		},
		select: {
			owner_id: true,
		},
	});

	if (!team)
		throw new AppError("Team not found.", 404);

	if (userId !== team.owner_id)
		throw new AppError("Only the owner of the team can delete it.", 403);

	return prisma.team.delete({
		where: {
			id: teamId,
		}
	});
};

// Get list of team members with team id
export const getTeamMembers = async (teamId: number) => {

	const team = await prisma.team.findUnique({
		where: {
			id: teamId,
		},
		select: {
			team_users: {
				select: {
					joined_at: true,
					user: {
						select: {
							id: true,
							username: true,
							avatar_url: true,
						}
					}
				},
			},
			_count: {
				select: {
					team_users: true,
				},
			},
		},
	});

	if (!team)
		throw new AppError("Team not found.", 404);

	const member_list = team.team_users.map((teamUser) => ({
		id: teamUser.user.id,
		username: teamUser.user.username,
		avatar_url: teamUser.user.avatar_url,
		joined_at: teamUser.joined_at,
	}));

	return {
		member_list,
		member_count: team._count.team_users,
	};
};
