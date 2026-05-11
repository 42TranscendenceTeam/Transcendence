import { Router } from "express";
import { asyncHandler } from "../utils/AppError.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getFriendsController } from "./friends.controller.js";

const router = Router();

router.get('/', authMiddleware, asyncHandler(getFriendsController));

export default router;