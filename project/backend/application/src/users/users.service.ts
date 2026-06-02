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

export const getUserById = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      avatar_url: true,
      bio: true,
      _count: {
        select: {
          first_friend: true,
          second_friend: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const teamMemberships = await prisma.teamUser.findMany({
    where: { user_id: userId },
    select: {
      team: {
        select: { status_ongoing: true },
      },
    },
  });

  const teamCount = teamMemberships.length;
  const activeTeams = teamMemberships.filter((tm) => tm.team.status_ongoing === true).length;
  const finishedTeams = teamMemberships.filter((tm) => tm.team.status_ongoing === false).length;

  const taskAssignments = await prisma.taskUser.findMany({
    where: { user_id: userId },
    select: {
      task: {
        select: { status: true },
      },
    },
  });

  const taskCount = taskAssignments.length;
  const tasksToDo = taskAssignments.filter((ta) => ta.task.status === 'open').length;
  const tasksInProgress = taskAssignments.filter((ta) => ta.task.status === 'in_progress').length;
  const tasksDone = taskAssignments.filter((ta) => ta.task.status === 'closed').length;

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatar_url: user.avatar_url ?? '/api/public/avatars/default.png',
    bio: user.bio ?? '',
    friendCount: user._count.first_friend + user._count.second_friend,
    teamCount,
    activeTeams,
    finishedTeams,
    taskCount,
    tasksToDo,
    tasksInProgress,
    tasksDone,
  };
};

export const searchUsers = async (query: string) => {
  const users = await prisma.user.findMany({
    where: {
      username: {
        contains: query,
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      username: true,
      avatar_url: true,
    },
  });

  return users.map((user) => ({
    ...user,
    avatar_url: user.avatar_url || "/api/public/avatars/default.png",
  }));
};

export const toggle2FA = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { two_factor_enabled: true },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      two_factor_enabled: !user.two_factor_enabled,
    },
    select: {
      id: true,
      email: true,
      username: true,
      two_factor_enabled: true,
    },
  });

  return updatedUser;
};
