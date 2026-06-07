import { prisma } from '../prisma.js';
import { JWT_SECRET } from '../config.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';
import type { RegisterDTO, LoginDTO } from './auth.types.js';
import { send2FACode } from "../utils/mailer.js";

export const register = async (data: RegisterDTO) => {
  const { email, username, password } = data;

  if (!email || !username || !password) {
    throw new AppError('Missing required fields', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const existingEmail = await prisma.user.findUnique({
    where: { email },
  });

  if (existingEmail) {
    throw new AppError('Email already exists', 400);
  }

  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    throw new AppError('Username already exists', 400);
  }

  const user = await prisma.user.create({
    data: {
      email,
      username,
      password_hash: hashedPassword,
    },
  });

  const token = jwt.sign({ id: user.id, type: "auth" }, JWT_SECRET);

  return {
    user: { id: user.id, email: user.email, username: user.username },
    token,
  };
};

export const checkEmail = async (email: string) => {
  if (!email) {
    throw new AppError('Email is required', 400);
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  return { exists: !!user };
};

export const login = async (data: LoginDTO) => {
  const { email, password } = data;

  if (!email || !password) {
    throw new AppError('Missing required fields', 400);
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isValid = await bcrypt.compare(password, user.password_hash);

  if (!isValid) {
    throw new AppError('Invalid password', 401);
  }

  if (user.two_factor_enabled) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await send2FACode(user.email, code);

    const tempToken = jwt.sign(
      {
        userId: user.id,
        twoFactorCode: code,
      },
      JWT_SECRET,
      { expiresIn: "5m" }
    );

    return {
      requires_2fa: true,
      temp_token: tempToken,
    };
  }

  const token = jwt.sign({ id: user.id, type: "auth" }, JWT_SECRET);

  return {
    user: { id: user.id, email: user.email, username: user.username },
    token,
  };
};

export const verify2FA = async (tempToken: string, code: string) => {
  if (!tempToken || !code) {
    throw new AppError("Missing required fields", 400);
  }

  let payload: any;

  try {
    payload = jwt.verify(tempToken, JWT_SECRET);
  } catch {
    throw new AppError("Invalid or expired token", 400);
  }

  if (payload.twoFactorCode !== code) {
    throw new AppError("Invalid code", 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const token = jwt.sign({ id: user.id, type: "auth" }, JWT_SECRET);

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    token,
  };
};
