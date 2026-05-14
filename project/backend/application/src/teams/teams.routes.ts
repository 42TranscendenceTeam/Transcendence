import { Router } from "express";
import { asyncHandler } from "../utils/AppError.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getTeamsListController } from "./teams.controller.js";

const router = Router();

router.get('/', authMiddleware, asyncHandler(getTeamsListController));

export default router;