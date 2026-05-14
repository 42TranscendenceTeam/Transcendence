import { Router } from "express";
import { asyncHandler } from "../utils/AppError.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getTeamsListController, createTeamController, getTeamController } from "./teams.controller.js";

const router = Router();

router.get('/', authMiddleware, asyncHandler(getTeamsListController));
router.post('/', authMiddleware, asyncHandler(createTeamController));
router.get('/:id', authMiddleware, asyncHandler(getTeamController));

export default router;