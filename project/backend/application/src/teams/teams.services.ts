import { AppError } from '../utils/AppError.js';
import { prisma } from '../prisma.js';
import type { CreateTeamDTO, UpdateTeamDTO } from './teams.types.js';
import { createNotification } from '../notifications/notifications.service.js';
import { getTeamJoinRequestsController } from './teams.controller.js';

// Return all teams info
export const getTeamsList = async () => {

	return prisma.team.findMany({
		select: {
			id: true,
			name: true,
			about: true,
			tags: true,
			max_users: true,
			created_at: true,
			status_ongoing: true,
			owner: {
				select: {
					id: true,
					username: true,
					avatar_url: true,
				},
			},
			_count: {
				select: {
					team_users: true,
				},
			},
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

	const team = await prisma.team.create({
		data: {
			owner_id: userId,
			name: info.name,
			max_users: info.max_users,
			about: info.about ?? null,
			tags: info.tags ?? null,
		},
	});

	await prisma.teamUser.create({
		data: {
			user_id: userId,
			team_id: team.id,
		},
	});

	return team;
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
			status_ongoing: true,
		},
	});

	if (!team)
		throw new AppError("Team not found.", 404);

	if (userId !== team.owner_id)
		throw new AppError("Only the owner of the team can update it.", 403);

	if (team.status_ongoing === false)
		throw new AppError("Closed teams cannot be updated.", 400);

	return prisma.team.update({
		where: {
			id: teamId,
		},
		data: {
			...info,
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
			name: true,
			team_users: {
				select: {
					user_id: true,
				},
			},
		},
	});

	if (!team)
		throw new AppError("Team not found.", 404);

	if (userId !== team.owner_id)
		throw new AppError("Only the owner of the team can delete it.", 403);

	const memberIds = team.team_users
		.filter(tu => tu.user_id !== userId)
		.map(tu => tu.user_id);

	const deleted = await prisma.team.delete({
		where: {
			id: teamId,
		}
	});

	await Promise.all(memberIds.map(memberId =>
		createNotification(
			memberId,
			'team_deleted',
			teamId,
			'team',
			userId,
			`The ${team.name} team has been deleted by its owner.`,
		)
	));

	return deleted;
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
			name: true,
		},
	});

	if (!team)
		throw new AppError("Team not found.", 404);

	if (userId !== team.owner_id)
		throw new AppError("Only the owner of the team can remove a user.", 403);

	if (memberId === team.owner_id)
		throw new AppError("Team owner cannot remove himself.", 400);

	const member = await prisma.teamUser.findFirst({
		where: {
			user_id: memberId,
			team_id: teamId,
		},
	});

	if (!member)
		throw new AppError("User is not a member of this team.", 404);

	const teamUser = await prisma.teamUser.delete({
		where: {
			user_id_team_id: {
				user_id: memberId,
				team_id: teamId,
			},
		},
	});

	await createNotification(
		memberId,
		'team_removed',
		teamId,
		'team',
		userId,
		`You were removed from the ${team.name} team.`,
	);

	return teamUser;
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
		select: {
			status_ongoing: true,
			owner_id: true,
			name: true,
			max_users: true,
			team_users: true,
		},
	});

	if (!team)
		throw new AppError("Team not found.", 404);

	if (team.status_ongoing === false)
		throw new AppError("Closed teams cannot receive join requests.", 400);

	if (team.max_users == team.team_users.length)
		throw new AppError("Team is full.", 400);

	const requestExists = await prisma.teamJoinRequest.findFirst({
		where: {
			status: 'pending',
			team_id: teamId,
			user_id: userId,
		},
	});

	if (requestExists)
		throw new AppError("That join request already exists.", 400);

	const pendingInvite = await prisma.teamInvite.findFirst({
		where: {
			status: 'pending',
			team_id: teamId,
			user_id: userId,
		},
	});

	if (pendingInvite)
		throw new AppError("You already have a pending invite to join this team. Accept or reject it first.", 400);

	const userInTeam = await prisma.teamUser.findFirst({
		where: {
			team_id: teamId,
			user_id: userId,
		},
	});

	if (userInTeam)
		throw new AppError("You are already in that team.", 400);

	const request = await prisma.teamJoinRequest.create({
		data: {
			user_id: userId,
			team_id: teamId,
		},
	});

	const user = await prisma.user.findUnique({
		where: {
			id: userId,
		},
		select: {
			username: true,
		},
	});

	await createNotification(
		team.owner_id,
		'team_join_request',
		request.id,
		'team_join_request',
		userId,
		`${user?.username ?? 'Someone'} requested to join ${team.name}.`,
	);

	return request;
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
					status_ongoing: true,
					name: true,
					max_users: true,
					team_users: true,
				}
			}
		}
	});

	if (!request)
		throw new AppError("Team join request not found.", 404);

	if (userId !== request.team.owner_id)
		throw new AppError("Only the team owner can accept join requests.", 403);

	if (request.team.status_ongoing === false)
		throw new AppError("Closed teams cannot accept join requests.", 400);

	if (request.team.max_users == request.team.team_users.length)
		throw new AppError("Team is full.", 400);

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

	await createNotification(
		request.user_id,
		'team_join_request_accepted',
		request.id,
		'team_join_request',
		request.team.owner_id,
		`You were accepted to join the ${request.team.name} team.`,
	);

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
					name: true,
				}
			}
		}
	});

	if (!request)
		throw new AppError("Team join request not found.", 404);

	if (userId !== request.team.owner_id)
		throw new AppError("Only the team owner can reject join requests.", 403);

	const status = await prisma.teamJoinRequest.update({
		where: {
			id: request.id,
		},
		data: {
			status: 'rejected',
		}
	});

	await createNotification(
		request.user_id,
		'team_join_request_rejected',
		request.id,
		'team_join_request',
		request.team.owner_id,
		`Your request to join ${request.team.name} was rejected.`,
	);

	return status;
};

// Get list of team invites for current user
export const getTeamInvites = async (userId: number) => {

	const invites = await prisma.teamInvite.findMany({
		where: {
			user_id: userId,
			status: 'pending',
		},
		select: {
			id: true,
			created_at: true,
			team: {
				select: {
					id: true,
					name: true,
					about: true,
					tags: true,
					max_users: true,
					status_ongoing: true,
				}
			}
		}
	});

	const invite_list = invites.map((invite) => ({
		invite_id: invite.id,
		sent_at: invite.created_at,
		team_id: invite.team.id,
		team_name: invite.team.name,
		team_about: invite.team.about,
		team_tags: invite.team.tags,
		team_max_users: invite.team.max_users,
		team_status_ongoing: invite.team.status_ongoing,
	}));

	return invite_list;
};

// Get list of team invites sent
export const getTeamInvitesSent = async (teamId: number) => {

	const invitesSent = await prisma.teamInvite.findMany({
		where: {
			team_id: teamId,
			status: 'pending',
		},
		select: {
			id: true,
			created_at: true,
			user_id: true,
		}
	});

	const invite_sent_list = invitesSent.map((invite) => ({
		invite_id: invite.id,
		sent_at: invite.created_at,
		user_id: invite.user_id,
	}));

	return invite_sent_list;
};


// Send invite from team to user
export const sendTeamInvite = async (userId: number, teamId: number, receiverId: number) => {

	const team = await prisma.team.findUnique({
		where: {
			id: teamId,
		},
		select: {
			owner_id: true,
			status_ongoing: true,
			name: true,
			owner: {
				select: {
					username: true,
				}
			},
			max_users: true,
			team_users: true,
		}
	});

	if (!team)
		throw new AppError("Team not found.", 404);

	if (userId !== team.owner_id)
		throw new AppError("Only the team owner can send invites.", 403);

	if (team.status_ongoing === false)
		throw new AppError("Closed teams cannot send invites.", 400);

	if (team.max_users == team.team_users.length)
		throw new AppError("Team is full.", 400);

	const inviteExists = await prisma.teamInvite.findFirst({
		where: {
			status: 'pending',
			team_id: teamId,
			user_id: receiverId,
		},
	});

	if (inviteExists)
		throw new AppError("That team invite already exists.", 400);

	const pendingRequest = await prisma.teamJoinRequest.findFirst({
		where: {
			status: 'pending',
			team_id: teamId,
			user_id: receiverId,
		},
	});

	if (pendingRequest)
		throw new AppError("That user already has a pending join request for this team. Accept or reject it first.", 400);

	const receiverExists = await prisma.user.findUnique({
		where: {
			id: receiverId,
		},
		select: {
			id: true,
		}
	});

	if (!receiverExists)
		throw new AppError("That user does not exist.", 404);

	const userInTeam = await prisma.teamUser.findFirst({
		where: {
			team_id: teamId,
			user_id: receiverId,
		},
	});

	if (userInTeam)
		throw new AppError("That user is already on your team.", 400);

	const invite = await prisma.teamInvite.create({
		data: {
			user_id: receiverId,
			team_id: teamId,
		},
	});

	await createNotification(
		receiverId,
		'team_invite',
		invite.id,
		'team_invite',
		team.owner_id,
		`${team.owner.username ?? 'Someone'} invited you to join their ${team.name} team.`,
	);

	return invite;
};

// Accept invite to team
export const acceptTeamInvite = async (userId: number, inviteId: number) => {

	const invite = await prisma.teamInvite.findFirst({
		where: {
			id: inviteId,
			status: 'pending',
		},
		select: {
			id: true,
			user_id: true,
			user: {
				select: {
					username: true,
				},
			},
			team_id: true,
			team: {
				select: {
					status_ongoing: true,
					owner_id: true,
					name: true,
					max_users: true,
					team_users: true,
				},
			},
		},
	});

	if (!invite)
		throw new AppError("Team invite not found.", 404);

	if (userId !== invite.user_id)
		throw new AppError("Only the invited user can accept this invite.", 403);

	if (invite.team.status_ongoing === false)
		throw new AppError("Closed teams cannot accept new members.", 400);

	if (invite.team.max_users == invite.team.team_users.length)
		throw new AppError("Team is full.", 400);

	const userInTeam = await prisma.teamUser.findFirst({
		where: {
			user_id: invite.user_id,
			team_id: invite.team_id,
		}
	});

	if (userInTeam)
		throw new AppError("User is already in that team.", 400);

	const newUser = await prisma.teamUser.create({
		data: {
			user_id: invite.user_id,
			team_id: invite.team_id,
		},
	});

	await prisma.teamInvite.update({
		where: {
			id: invite.id,
		},
		data: {
			status: 'accepted',
		}
	});

	await createNotification(
		invite.team.owner_id,
		'team_invite_accepted',
		invite.id,
		'team_invite',
		invite.user_id,
		`${invite.user.username} accepted to join the ${invite.team.name} team.`,
	);

	return newUser;
};

// Reject invite to team
export const rejectTeamInvite = async (userId: number, inviteId: number) => {

	const invite = await prisma.teamInvite.findFirst({
		where: {
			id: inviteId,
			status: 'pending',
		},
		select: {
			id: true,
			user_id: true,
			user: {
				select: {
					username: true,
				},
			},
			team: {
				select: {
					owner_id: true,
					name: true,
				},
			},
		},
	});

	if (!invite)
		throw new AppError("Team invite not found.", 404);

	if (userId !== invite.user_id)
		throw new AppError("Only the invited user can reject this invite.", 403);

	const teamInvite = await prisma.teamInvite.update({
		where: {
			id: invite.id,
		},
		data: {
			status: 'rejected',
		},
	});

	await createNotification(
		invite.team.owner_id,
		'team_invite_rejected',
		invite.id,
		'team_invite',
		userId,
		`${invite.user.username} declined your invite to join ${invite.team.name}.`,
	);

	return teamInvite;
};

// Leave team with logged-in user
export const leaveTeam = async (userId: number, teamId: number) => {

	const team = await prisma.team.findUnique({
		where: {
			id: teamId,
		},
		select: {
			owner_id: true,
			name: true,
		},
	});

	if (!team)
		throw new AppError("Team not found.", 404);

	if (userId === team.owner_id)
		throw new AppError("Team owner cannot leave the team. Delete the team instead.", 400);

	const member = await prisma.teamUser.findFirst({
		where: {
			user_id: userId,
			team_id: teamId,
		},
	});

	if (!member)
		throw new AppError("You are not a member of this team.", 400);

	const teamUser = await prisma.teamUser.delete({
		where: {
			user_id_team_id: {
				user_id: userId,
				team_id: teamId,
			},
		},
	});

	const userName = await prisma.user.findUnique({
		where: {
			id: userId,
		},
		select: {
			username: true,
		},
	});

	await createNotification(
		team.owner_id,
		'team_user_left',
		teamId,
		'team',
		userId,
		`${userName?.username ?? 'Someone'} left ${team.name}.`,
	);

	return teamUser;
};
