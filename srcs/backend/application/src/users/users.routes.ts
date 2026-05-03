import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { getMeController, updateMeController, searchUsersController } from './users.controller.js';
import { asyncHandler } from '../utils/AppError.js';

const router = Router();

router.get('/me', authMiddleware, asyncHandler(getMeController));
router.put('/me', authMiddleware, asyncHandler(updateMeController));
router.get('/search', authMiddleware, asyncHandler(searchUsersController));

export default router;
