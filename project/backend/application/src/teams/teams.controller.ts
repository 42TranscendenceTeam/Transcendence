import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { AppError } from '../utils/AppError.js';
import { getTeamsList, createTeam, getTeam, updateTeam, deleteTeam, getTeamMembers, removeTeamMember, getTeamJoinRequests, sendTeamJoinRequest, acceptJoinRequest, rejectJoinRequest } from './teams.services.js';

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

export const getTeamController = async (req: AuthRequest, res: Response) => {
	const teamId = Number(req.params.id);

	if (Number.isNaN(teamId))
		throw new AppError("Mandatory valid team ID.", 400);

	const info = await getTeam(teamId);
	return res.json(info);
};

export const updateTeamController = async (req: AuthRequest, res: Response) => {
	const teamId = Number(req.params.id);
	const { name, about, tags, status_ongoing } = req.body;

	if (Number.isNaN(teamId))
		throw new AppError("Mandatory valid team ID.", 400);

	if (!name)
		throw new AppError("Valid team name is required.", 400);

	const info = await updateTeam(req.user!.id, teamId, { name, about, tags, status_ongoing });
	return res.json(info);
};

export const deleteTeamController = async (req: AuthRequest, res: Response) => {
	const teamId = Number(req.params.id);

	if (Number.isNaN(teamId))
		throw new AppError("Mandatory valid team ID.", 400);

	const team = await deleteTeam(req.user!.id, teamId);
	return res.status(200).json(team);
};

export const getTeamMembersController = async (req: AuthRequest, res: Response) => {
	const teamId = Number(req.params.id);

	if (Number.isNaN(teamId))
		throw new AppError("Mandatory valid team ID.", 400);

	const members = await getTeamMembers(teamId);
	return res.json(members);
};

export const removeTeamMemberController = async (req: AuthRequest, res: Response) => {
	const teamId = Number(req.params.id);
	const memberId = Number(req.params.memberId);

	if (Number.isNaN(teamId))
		throw new AppError("Mandatory valid team ID.", 400);

	if (Number.isNaN(memberId))
		throw new AppError("Mandatory valid member ID.", 400);

	const member = await removeTeamMember(req.user!.id, teamId, memberId);
	return res.status(200).json(member);
};

export const getTeamJoinRequestsController = async (req: AuthRequest, res: Response) => {
	const teamId = Number(req.params.id);

	if (Number.isNaN(teamId))
		throw new AppError("Mandatory valid team ID.", 400);

	const requests = await getTeamJoinRequests(teamId);
	return res.json(requests);
};

export const sendTeamJoinRequestController = async (req: AuthRequest, res: Response) => {
	const teamId = Number(req.params.id);

	if (Number.isNaN(teamId))
		throw new AppError("Mandatory valid team ID.", 400);

	const requests = await sendTeamJoinRequest(req.user!.id, teamId);
	return res.json(requests);
};

export const acceptJoinRequestController = async (req: AuthRequest, res: Response) => {
	const teamId = Number(req.params.id);
	const requestId = Number(req.params.requestId);

	if (Number.isNaN(teamId))
		throw new AppError("Mandatory valid team ID.", 400);

	if (Number.isNaN(requestId))
		throw new AppError("Mandatory valid request ID.", 400);

	const newMember = await acceptJoinRequest(req.user!.id, teamId, requestId);

	return res.status(201).json(newMember);
};

export const rejectJoinRequestController = async (req: AuthRequest, res: Response) => {
	const teamId = Number(req.params.id);
	const requestId = Number(req.params.requestId);

	if (Number.isNaN(teamId))
		throw new AppError("Mandatory valid team ID.", 400);

	if (Number.isNaN(requestId))
		throw new AppError("Mandatory valid request ID.", 400);

	const request = await rejectJoinRequest(req.user!.id, teamId, requestId);

	return res.status(200).json(request);
};
