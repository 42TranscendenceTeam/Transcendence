import { Router } from "express";
import { asyncHandler } from "../utils/AppError.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getNotificationsController, getUnreadNotificationsController } from "./notifications.controller.js";

const router = Router();

router.get('/', authMiddleware, asyncHandler(getNotificationsController));
router.get('/unread', authMiddleware, asyncHandler(getUnreadNotificationsController));

export default router;
