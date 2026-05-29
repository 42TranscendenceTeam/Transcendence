import { Router } from "express";
import { asyncHandler } from "../utils/AppError.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getTeamSentMessagesController, getTeamReceivedMessagesController, getAllMessagesController, sendTeamMessageController, deleteTeamMessageController, } from "./team_message.controller.js";

const router = Router();

router.get('/:id', authMiddleware, asyncHandler(getAllMessagesController));
router.get('/:id/sent', authMiddleware, asyncHandler(getTeamSentMessagesController));
router.get('/:id/received', authMiddleware, asyncHandler(getTeamReceivedMessagesController));
router.post('/:id', authMiddleware, asyncHandler(sendTeamMessageController));
router.delete('/:message_id', authMiddleware, asyncHandler(deleteTeamMessageController));

export default router;
