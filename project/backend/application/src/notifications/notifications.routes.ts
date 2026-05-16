import { Router } from "express";
import { asyncHandler } from "../utils/AppError.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getNotificationsController } from "./notifications.controller.js";

const router = Router();

router.get('/', authMiddleware, asyncHandler(getNotificationsController));

export default router;
