import { Router } from "express";
import { asyncHandler } from "../utils/AppError.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getSentMessagesController, getReceivedMessagesController, getAllMessagesController, sendMessageController, updateReadStatusController, deleteMessageController, } from "./message.controller.js";

const router = Router();

// NOTE: ':amount' is the number of messages you want to receive (0 sends 1000 exchanged message)
// NOTE: The messages are sent in an array ordered by sent_date (from newest to oldest)
router.get('/:id/:amount', authMiddleware, asyncHandler(getAllMessagesController));
router.get('/:id/received/:amount', authMiddleware, asyncHandler(getReceivedMessagesController));
router.get('/:id/sent/:amount', authMiddleware, asyncHandler(getSentMessagesController));
router.post('/:id', authMiddleware, asyncHandler(sendMessageController));
router.put('/:id', authMiddleware, asyncHandler(updateReadStatusController));
router.delete('/:message_id', authMiddleware, asyncHandler(deleteMessageController));

export default router;
