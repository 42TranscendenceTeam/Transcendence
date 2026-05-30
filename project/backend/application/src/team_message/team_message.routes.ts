import { Router } from "express";
import { asyncHandler } from "../utils/AppError.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getTeamSentMessagesController, getTeamReceivedMessagesController, getAllMessagesController, sendTeamMessageController, deleteTeamMessageController, } from "./team_message.controller.js";

const router = Router();

// NOTE: ':amount' is the number of messages you want to receive (0 sends 1000 exchanged message)
// NOTE: The messages are sent in an array ordered by sent_date (from newest to oldest)
router.get('/:id/:amount', authMiddleware, asyncHandler(getAllMessagesController));
router.get('/:id/sent/:amount', authMiddleware, asyncHandler(getTeamSentMessagesController));
router.get('/:id/received/:amount', authMiddleware, asyncHandler(getTeamReceivedMessagesController));
router.post('/:id', authMiddleware, asyncHandler(sendTeamMessageController));
router.delete('/:message_id', authMiddleware, asyncHandler(deleteTeamMessageController));

export default router;
