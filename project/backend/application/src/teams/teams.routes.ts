import { Router } from "express";
import { asyncHandler } from "../utils/AppError.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getTeamsListController, createTeamController, getTeamController, updateTeamController, deleteTeamController, getTeamMembersController, removeTeamMemberController, getTeamJoinRequestsController } from "./teams.controller.js";

const router = Router();

router.get('/', authMiddleware, asyncHandler(getTeamsListController));
router.post('/', authMiddleware, asyncHandler(createTeamController));
router.delete('/:id/members/:memberId', authMiddleware, asyncHandler(removeTeamMemberController));
router.get('/:id/members', authMiddleware, asyncHandler(getTeamMembersController));
router.get('/:id/join-requests', authMiddleware, asyncHandler(getTeamJoinRequestsController));
router.get('/:id', authMiddleware, asyncHandler(getTeamController));
router.put('/:id', authMiddleware, asyncHandler(updateTeamController));
router.delete('/:id', authMiddleware, asyncHandler(deleteTeamController));

export default router;
