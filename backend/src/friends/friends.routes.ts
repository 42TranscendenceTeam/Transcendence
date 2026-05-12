import { Router } from "express";
import { asyncHandler } from "../utils/AppError.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getFriendsController, getSentFriendRequestsController, getReceivedFriendRequestsController, sendFriendRequestController, acceptFriendRequestController, declineFriendRequestController } from "./friends.controller.js";

const router = Router();

router.get('/', authMiddleware, asyncHandler(getFriendsController));
router.get('/requests/sent', authMiddleware, asyncHandler(getSentFriendRequestsController));
router.get('/requests/received', authMiddleware, asyncHandler(getReceivedFriendRequestsController));
router.post('/requests', authMiddleware, asyncHandler(sendFriendRequestController));
router.post('/requests/:id/accept', authMiddleware, asyncHandler(acceptFriendRequestController));
router.post('/requests/:id/decline', authMiddleware, asyncHandler(declineFriendRequestController));

export default router;