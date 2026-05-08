import { prisma } from '../prisma.js';
import { AppError } from '../utils/AppError.js';
import type { UpdateUserDTO } from './users.types.js';

export const getMe = async (userId: number) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
    },
  });
};

export const updateMe = async (userId: number, data: UpdateUserDTO) => {
  const { email, username } = data;

  if (email) {
    const existingEmail = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id: userId },
      },
    });

    if (existingEmail) {
      throw new AppError('Email already in use', 400);
    }
  }

  if (username) {
    const existingUsername = await prisma.user.findFirst({
      where: {
        username,
        NOT: { id: userId },
      },
    });

    if (existingUsername) {
      throw new AppError('Username already in use', 400);
    }
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      ...data,
      edited_at: new Date(),
    },
    select: {
      id: true,
      email: true,
      username: true,
      bio: true,
      avatar_url: true,
    },
  });
};

export const searchUsers = async (query: string) => {
  return prisma.user.findMany({
    where: {
      username: {
        contains: query,
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      username: true,
    },
  });
};
