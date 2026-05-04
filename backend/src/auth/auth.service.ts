import { prisma } from '../prisma.js';
import { JWT_SECRET } from '../config.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

type RegisterData = {
  email: string;
  username: string;
  password: string;
};

type LoginData = {
  email: string;
  password: string;
};

export const register = async (data: RegisterData) => {
  const { email, username, password } = data;

  const hashedPassword = await bcrypt.hash(password, 10);

  const existingEmail = await prisma.user.findUnique({
    where: { email },
  });

  if (existingEmail) {
    throw new Error('Email already exists');
  }

  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    throw new Error('Username already exists');
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

export const login = async (data: LoginData) => {
  const { email, password } = data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const isValid = await bcrypt.compare(password, user.password_hash);

  if (!isValid) {
    throw new Error('Invalid password');
  }

  const token = jwt.sign({ id: user.id }, JWT_SECRET);

  return {
    user: { id: user.id, email: user.email, username: user.username },
    token,
  };
};
