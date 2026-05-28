import { Router } from "express";
import { asyncHandler } from "../utils/AppError.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getTaskController, updateTaskStatusController, updateTaskUsersController, deleteTaskController } from "./tasks.controller.js";

const router = Router();

router.get('/:id', authMiddleware, asyncHandler(getTaskController));
router.patch('/:id/status', authMiddleware, asyncHandler(updateTaskStatusController));
router.patch('/:id/users', authMiddleware, asyncHandler(updateTaskUsersController));
router.delete('/:id', authMiddleware, asyncHandler(deleteTaskController));

export default router;
