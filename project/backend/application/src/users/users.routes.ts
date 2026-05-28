import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { getMeController, updateMeController, searchUsersController, getUserByIdController } from './users.controller.js';
import { asyncHandler } from '../utils/AppError.js';
import { uploadAvatar } from '../middleware/uploadAvatar.js';

const router = Router();

router.get('/me', authMiddleware, asyncHandler(getMeController));
router.put('/me', authMiddleware, uploadAvatar.single('avatar'), asyncHandler(updateMeController));
router.get('/search', authMiddleware, asyncHandler(searchUsersController));
router.get('/:id', authMiddleware, asyncHandler(getUserByIdController));

export default router;
