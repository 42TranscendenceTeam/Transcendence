import { Router } from "express";
import { asyncHandler } from "../utils/AppError.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getTeamsListController, createTeamController, getTeamController, updateTeamController, deleteTeamController, getTeamMembersController } from "./teams.controller.js";

const router = Router();

router.get('/', authMiddleware, asyncHandler(getTeamsListController));
router.post('/', authMiddleware, asyncHandler(createTeamController));
router.get('/:id/members', authMiddleware, asyncHandler(getTeamMembersController));
router.get('/:id', authMiddleware, asyncHandler(getTeamController));
router.put('/:id', authMiddleware, asyncHandler(updateTeamController));
router.delete('/:id', authMiddleware, asyncHandler(deleteTeamController));

export default router;
