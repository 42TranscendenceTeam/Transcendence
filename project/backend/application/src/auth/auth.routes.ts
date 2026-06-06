import express from 'express';
import { registerUser, loginUser, verify2FAController, checkEmailController } from './auth.controller.js';
import { asyncHandler } from '../utils/AppError.js';

const router = express.Router();

router.post('/register', asyncHandler(registerUser));
router.post('/login', asyncHandler(loginUser));
router.post('/verify-2fa', asyncHandler(verify2FAController));
router.post('/check-email', asyncHandler(checkEmailController));

export default router;
