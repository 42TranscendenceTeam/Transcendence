import { prisma } from '../prisma.js';
import { JWT_SECRET } from '../config.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';
import type { RegisterDTO, LoginDTO } from './auth.types.js';

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

  const token = jwt.sign({ id: user.id }, JWT_SECRET);

  return {
    user: { id: user.id, email: user.email, username: user.username },
    token,
  };
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

  const token = jwt.sign({ id: user.id }, JWT_SECRET);

  return {
    user: { id: user.id, email: user.email, username: user.username },
    token,
  };
};
