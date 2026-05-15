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

// Remove a member from a team with team id and member id
export const removeTeamMember = async (userId: number, teamId: number, memberId: number) => {

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
		throw new AppError("Only the owner of the team can remove a user.", 403);

	if (memberId === team.owner_id)
		throw new AppError("Team owner cannot remove himself.", 400);

	return prisma.teamUser.delete({
		where: {
			user_id_team_id: {
				user_id: memberId,
				team_id: teamId,
			},
		},
	});
};

// Get list of team join requests with team id
export const getTeamJoinRequests = async (teamId: number) => {

	const team = await prisma.team.findUnique({
		where: {
			id: teamId,
		},
		select: {
			team_join_requests: {
				where: {
					status: 'pending',
				},
				select: {
					id: true,
					created_at: true,
					user: {
						select: {
							id: true,
							username: true,
							avatar_url: true,
						},
					},
				},
			},
		},
	});

	if (!team)
		throw new AppError("Team not found.", 404);

	const request_list = team.team_join_requests.map((joinRequest) => ({
		request_id: joinRequest.id,
		user_id: joinRequest.user.id,
		username: joinRequest.user.username,
		avatar_url: joinRequest.user.avatar_url,
		requested_at: joinRequest.created_at,
	}));

	return {
		request_list,
		request_count: request_list.length,
	};
};

// Send join request to team with team id
export const sendTeamJoinRequest = async (userId: number, teamId: number) => {

	const team = await prisma.team.findUnique({
		where: {
			id: teamId,
		},
	});

	if (!team)
		throw new AppError("Team not found.", 404);

	const requestExists = await prisma.teamJoinRequest.findFirst({
		where: {
			status: 'pending',
			team_id: teamId,
			user_id: userId,
		},
	});

	if (requestExists)
		throw new AppError("That join request already exists.", 400);

	const userInTeam = await prisma.teamUser.findFirst({
		where: {
			team_id: teamId,
			user_id: userId,
		},
	});

	if (userInTeam)
		throw new AppError("You are already in that team.", 400);

	return prisma.teamJoinRequest.create({
		data: {
			user_id: userId,
			team_id: teamId,
		},
	});
};

// Accept join request to team with team id and request id
export const acceptJoinRequest = async (userId: number, teamId: number, requestId: number) => {

	const request = await prisma.teamJoinRequest.findFirst({
		where: {
			id: requestId,
			team_id: teamId,
			status: 'pending',
		},
		select: {
			id: true,
			user_id: true,
			team_id: true,
			team: {
				select: {
					owner_id: true,
				}
			}
		}
	});

	if (!request)
		throw new AppError("Team join request not found.", 404);

	if (userId !== request.team.owner_id)
		throw new AppError("Only the team owner can accept join requests.", 403);

	const userInTeam = await prisma.teamUser.findFirst({
		where: {
			user_id: request.user_id,
			team_id: request.team_id,
		}
	});

	if (userInTeam)
		throw new AppError("User is already in that team.", 400);

	const newUser = await prisma.teamUser.create({
		data: {
			user_id: request.user_id,
			team_id: request.team_id,
		},
	});

	await prisma.teamJoinRequest.update({
		where: {
			id: request.id,
		},
		data: {
			status: 'accepted',
		}
	});

	return newUser;
};

// Reject join request to team with team id and request id
export const rejectJoinRequest = async (userId: number, teamId: number, requestId: number) => {

	const request = await prisma.teamJoinRequest.findFirst({
		where: {
			id: requestId,
			team_id: teamId,
			status: 'pending',
		},
		select: {
			id: true,
			user_id: true,
			team_id: true,
			team: {
				select: {
					owner_id: true,
				}
			}
		}
	});

	if (!request)
		throw new AppError("Team join request not found.", 404);

	if (userId !== request.team.owner_id)
		throw new AppError("Only the team owner can reject join requests.", 403);

	return prisma.teamJoinRequest.update({
		where: {
			id: request.id,
		},
		data: {
			status: 'rejected',
		}
	});
};
