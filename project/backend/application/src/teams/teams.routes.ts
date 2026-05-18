import { Router } from "express";
import { asyncHandler } from "../utils/AppError.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getTeamsListController, createTeamController, getTeamController, updateTeamController, deleteTeamController, getTeamMembersController, removeTeamMemberController, getTeamJoinRequestsController, sendTeamJoinRequestController, acceptJoinRequestController, rejectJoinRequestController, getTeamInvitesController, sendTeamInviteController, acceptTeamInviteController, rejectTeamInviteController, leaveTeamController } from "./teams.controller.js";

const router = Router();

router.get('/', authMiddleware, asyncHandler(getTeamsListController));
router.post('/', authMiddleware, asyncHandler(createTeamController));

router.get('/invites', authMiddleware, asyncHandler(getTeamInvitesController));
router.post('/invites/:inviteId/accept', authMiddleware, asyncHandler(acceptTeamInviteController));
router.post('/invites/:inviteId/reject', authMiddleware, asyncHandler(rejectTeamInviteController));

router.delete('/:id/members/:memberId', authMiddleware, asyncHandler(removeTeamMemberController));
router.get('/:id/members', authMiddleware, asyncHandler(getTeamMembersController));

router.post('/:id/join-requests/:requestId/accept', authMiddleware, asyncHandler(acceptJoinRequestController));
router.post('/:id/join-requests/:requestId/reject', authMiddleware, asyncHandler(rejectJoinRequestController));
router.get('/:id/join-requests', authMiddleware, asyncHandler(getTeamJoinRequestsController));
router.post('/:id/join-requests', authMiddleware, asyncHandler(sendTeamJoinRequestController));

router.post('/:id/invites', authMiddleware, asyncHandler(sendTeamInviteController));
router.delete('/:id/leave', authMiddleware, asyncHandler(leaveTeamController));

router.get('/:id', authMiddleware, asyncHandler(getTeamController));
router.put('/:id', authMiddleware, asyncHandler(updateTeamController));
router.delete('/:id', authMiddleware, asyncHandler(deleteTeamController));

export default router;
