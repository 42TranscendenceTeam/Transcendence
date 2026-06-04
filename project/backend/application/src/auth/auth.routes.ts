import express from 'express';
import { registerUser, loginUser, checkEmailController } from './auth.controller.js';
import { asyncHandler } from '../utils/AppError.js';

const router = express.Router();

router.post('/register', asyncHandler(registerUser));
router.post('/login', asyncHandler(loginUser));
router.post('/check-email', asyncHandler(checkEmailController));

export default router;
