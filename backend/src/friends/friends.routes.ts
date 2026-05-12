import { Router } from "express";
import { asyncHandler } from "../utils/AppError.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getFriendsController, getSentFriendRequestsController, getReceivedFriendRequestsController, sendFriendRequestController } from "./friends.controller.js";

const router = Router();

router.get('/', authMiddleware, asyncHandler(getFriendsController));
router.get('/requests/sent', authMiddleware, asyncHandler(getSentFriendRequestsController));
router.get('/requests/received', authMiddleware, asyncHandler(getReceivedFriendRequestsController));
router.post('/requests', authMiddleware, asyncHandler(sendFriendRequestController));

export default router;