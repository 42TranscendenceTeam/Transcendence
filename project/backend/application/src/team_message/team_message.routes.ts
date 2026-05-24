import { Router } from "express";
import { asyncHandler } from "../utils/AppError.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getSentMessagesController, getReceivedMessagesController, getAllMessagesController, sendMessageController, updateReadStatusController, deleteMessageController, } from "./message.controller.js";

const router = Router();

router.get('/message', authMiddleware, asyncHandler(getAllMessagesController));
router.get('/message/sent', authMiddleware, asyncHandler(getSentMessagesController));
router.get('/message/received', authMiddleware, asyncHandler(getReceivedMessagesController));
router.post('/message/:id', authMiddleware, asyncHandler(sendMessageController));
router.put('/message/:id', authMiddleware, asyncHandler(updateReadStatusController));
router.delete('/message/:id', authMiddleware, asyncHandler(deleteMessageController));

export default router;
