import { prisma } from '../prisma.js';
import { AppError } from '../utils/AppError.js';
import type { UpdateUserDTO } from './users.types.js';
import fs from 'fs';
import path from 'path';

export const getMe = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      bio: true,
      avatar_url: true,
    },
  });

  return {
    ...user,
    avatar_url: user?.avatar_url ?? "/api/public/avatars/default.png",
  };
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

  if (data.avatar_url) {
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar_url: true },
    });

    if (currentUser?.avatar_url) {
      const filename = path.basename(currentUser.avatar_url);

      const oldAvatarPath = path.join('/app/uploads/avatars', filename);

      if (fs.existsSync(oldAvatarPath))
        fs.unlinkSync(oldAvatarPath);
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
