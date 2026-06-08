import { Router } from "express";
import { asyncHandler } from "../utils/AppError.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getTeamsListController, createTeamController, getTeamController, updateTeamController, deleteTeamController, getTeamMembersController, removeTeamMemberController, getTeamJoinRequestsController, sendTeamJoinRequestController, acceptJoinRequestController, rejectJoinRequestController, getTeamInvitesController, getTeamInvitesSentController, sendTeamInviteController, acceptTeamInviteController, rejectTeamInviteController, leaveTeamController } from "./teams.controller.js";
import { createTaskController, getTeamTasksController } from "../tasks/tasks.controller.js";
import { getTeamSentMessagesController, getTeamReceivedMessagesController, getAllMessagesController, sendTeamMessageController, deleteTeamMessageController, } from "./team_message.controller.js";

const router = Router();

router.get('/', asyncHandler(getTeamsListController));
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

router.get('/:id/invites-sent', authMiddleware, asyncHandler(getTeamInvitesSentController));
router.post('/:id/invites', authMiddleware, asyncHandler(sendTeamInviteController));
router.delete('/:id/leave', authMiddleware, asyncHandler(leaveTeamController));

router.get('/:id', authMiddleware, asyncHandler(getTeamController));
router.put('/:id', authMiddleware, asyncHandler(updateTeamController));
router.delete('/:id', authMiddleware, asyncHandler(deleteTeamController));

router.post('/:id/tasks', authMiddleware, asyncHandler(createTaskController));
router.get('/:id/tasks', authMiddleware, asyncHandler(getTeamTasksController));

///////////////////////////////  MESSAGES /////////////////////////////////////
// NOTE: ':amount' is the number of messages you want to receive (0 sends 1000 exchanged message)
// NOTE: The messages are sent in an array ordered by sent_date (from newest to oldest)
router.get('/:id/message/:amount', authMiddleware, asyncHandler(getAllMessagesController));
router.get('/:id/message/sent/:amount', authMiddleware, asyncHandler(getTeamSentMessagesController));
router.get('/:id/message/received/:amount', authMiddleware, asyncHandler(getTeamReceivedMessagesController));
router.post('/:id/message', authMiddleware, asyncHandler(sendTeamMessageController));
router.delete('/:id/message/:message_id', authMiddleware, asyncHandler(deleteTeamMessageController));

export default router;
