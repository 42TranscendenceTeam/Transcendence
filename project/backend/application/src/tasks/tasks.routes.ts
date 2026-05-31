import { Router } from "express";
import { asyncHandler } from "../utils/AppError.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getTaskController, updateTaskStatusController, updateTaskUsersController, deleteTaskController, uploadTaskFileController, getTaskFilesController, deleteFileController, downloadFileController } from "./tasks.controller.js";
import { uploadFile } from "../middleware/uploadFiles.js"

const router = Router();

router.get('/:id', authMiddleware, asyncHandler(getTaskController));
router.patch('/:id/status', authMiddleware, asyncHandler(updateTaskStatusController));
router.patch('/:id/users', authMiddleware, asyncHandler(updateTaskUsersController));
router.delete('/:id', authMiddleware, asyncHandler(deleteTaskController));

router.post('/:id/files', authMiddleware, uploadFile.single('file'), asyncHandler(uploadTaskFileController));
router.get('/:id/files', authMiddleware, asyncHandler(getTaskFilesController));
router.delete('/files/:id', authMiddleware, asyncHandler(deleteFileController));
router.get('/files/:id/download', authMiddleware, asyncHandler(downloadFileController));

export default router;
