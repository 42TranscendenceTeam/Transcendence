import { Router } from "express";
import { asyncHandler } from "../utils/AppError.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getTeamSentMessagesController, getTeamReceivedMessagesController, getAllMessagesController, sendTeamMessageController, updateReadStatusController, deleteTeamMessageController, } from "./team_message.controller.js";

const router = Router();

router.get('/team/:id/message', authMiddleware, asyncHandler(getAllMessagesController));
router.get('/team/:id/message/sent', authMiddleware, asyncHandler(getTeamSentMessagesController));
router.get('/team/:id/message/received', authMiddleware, asyncHandler(getTeamReceivedMessagesController));
router.post('/team/:id/message/:id', authMiddleware, asyncHandler(sendTeamMessageController));
router.delete('/team/:id/message/:id', authMiddleware, asyncHandler(deleteTeamMessageController));

export default router;
