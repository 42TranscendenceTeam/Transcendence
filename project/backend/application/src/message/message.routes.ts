import { Router } from "express";
import { asyncHandler } from "../utils/AppError.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getSentMessagesController, getReceivedMessagesController, getAllMessagesController, sendMessageController, updateReadStatusController, deleteMessageController, } from "./message.controller.js";

const router = Router();

router.get('/:id', authMiddleware, asyncHandler(getAllMessagesController));
router.get('/:id/received', authMiddleware, asyncHandler(getReceivedMessagesController));
router.get('/:id/sent', authMiddleware, asyncHandler(getSentMessagesController));
router.post('/:id', authMiddleware, asyncHandler(sendMessageController));
router.put('/:id', authMiddleware, asyncHandler(updateReadStatusController));
router.delete('/:message_id', authMiddleware, asyncHandler(deleteMessageController));

export default router;
