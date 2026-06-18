import { prisma } from "../prisma.js";
import { AppError } from "../utils/AppError.js";
import type { CreateTaskDTO } from "./tasks.types.js";
import fs from "fs";
import path from 'path';

export const createTask = async ( creatorId: number, teamId: number, data: CreateTaskDTO) => {

	if (data.title.length > 25)
		return { error: "task title length >25" };

  const team = await prisma.team.findUnique({
    where: { id: teamId },
  });

  if (!team)
    throw new AppError("Team not found.", 404);

  const isMember = await prisma.teamUser.findFirst({
    where: { team_id: teamId, user_id: creatorId },
  });

  if (!isMember)
    throw new AppError("You are not a member of this team.", 403);

  const allowed = ["open", "in_progress", "closed"];

  if (data.status && !allowed.includes(data.status)) {
    throw new AppError("Invalid status.", 400);
  }

  if (data.user_ids && !Array.isArray(data.user_ids)) {
    throw new AppError("user_ids must be an array.", 400);
  }

  let validUsers: { user_id: number }[] = [];

  if (data.user_ids?.length) {
    validUsers = await prisma.teamUser.findMany({
      where: {
        team_id: teamId,
        user_id: { in: data.user_ids },
      },
      select: { user_id: true },
    });

    if (validUsers.length !== data.user_ids.length) {
      throw new AppError("Some users are not team members.", 400);
    }
  }

  const task = await prisma.task.create({
    data: {
      team_id: teamId,
      creator_id: creatorId,
      title: data.title,
      description: data.description,
      status: data.status || "open"
    },
  });

  if (validUsers.length) {
    await prisma.taskUser.createMany({
      data: validUsers.map((u) => ({
        task_id: task.id,
        user_id: u.user_id,
      })),
    });
  }

  return prisma.task.findUnique({
    where: { id: task.id },
      include: {
        creator: {
          select: { id: true, username: true, avatar_url: true },
        },
      task_users: {
        include: {
          user: {
            select: { id: true, username: true, avatar_url: true },
          },
        },
      },
    },
  });
};

export const getTeamTasks = async (teamId: number, requesterId: number) => {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
  });

  if (!team)
    throw new AppError("Team not found.", 404);

  const isMember = await prisma.teamUser.findFirst({
    where: {
      team_id: teamId,
      user_id: requesterId,
    },
  });

  if (!isMember)
    throw new AppError("You are not a member of this team.", 403);

  return prisma.task.findMany({
    where: { team_id: teamId },
    orderBy: { created_at: "desc" },
    include: {
      creator: {
        select: { id: true, username: true, avatar_url: true },
      },
      task_users: {
        include: {
          user: {
            select: { id: true, username: true, avatar_url: true },
          },
        },
      },
    },
  });
};

export const getTask = async (taskId: number, requesterId: number) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      creator: {
        select: { id: true, username: true, avatar_url: true },
      },
      task_users: {
        include: {
          user: {
            select: { id: true, username: true, avatar_url: true },
          },
        },
      },
    },
  });

  if (!task)
    throw new AppError("Task not found.", 404);

  const isMember = await prisma.teamUser.findFirst({
    where: {
      team_id: task.team_id,
      user_id: requesterId,
    },
  });

  if (!isMember)
    throw new AppError("You are not a member of this team.", 403);

  return task;
};

export const updateTaskStatus = async (taskId: number, requesterId: number, status: "open" | "in_progress" | "closed") => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task)
    throw new AppError("Task not found.", 404);

  const isMember = await prisma.teamUser.findFirst({
    where: {
      team_id: task.team_id,
      user_id: requesterId,
    },
  });

  if (!isMember)
    throw new AppError("You are not a member of this team.", 403);

  const allowed = ["open", "in_progress", "closed"];

  if (!allowed.includes(status)) {
    throw new AppError("Invalid status", 400);
  }

  const finished_at = status === "closed" ? new Date() : null;

  return prisma.task.update({
    where: { id: taskId },
    data: { status, finished_at },
    include: {
      creator: {
        select: {id: true, username: true, avatar_url: true },
      },
      task_users: {
        include: {
          user: {
            select: { id: true, username: true, avatar_url: true },
          },
        },
      },
    },
  });
};

export const updateTaskUsers = async (taskId: number, requesterId: number, userIds: number[]) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task)
    throw new AppError("Task not found.", 404);

  const isMember = await prisma.teamUser.findFirst({
    where: {
      team_id: task.team_id,
      user_id: requesterId,
    },
  });

  if (!isMember)
    throw new AppError("You are not a member of this team.", 403);

  const validUsers = await prisma.teamUser.findMany({
    where: {
      team_id: task.team_id,
      user_id: { in: userIds },
    },
    select: { user_id: true },
  });

  if (validUsers.length !== userIds.length) {
    throw new AppError("Some users are not team members.", 400);
  }

  await prisma.taskUser.deleteMany({
    where: { task_id: taskId },
  });

  return prisma.taskUser.createMany({
    data: validUsers.map((u) => ({
      task_id: taskId,
      user_id: u.user_id,
    })),
  });
};

export const deleteTask = async (taskId: number, requesterId: number) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task)
    throw new AppError("Task not found.", 404);

  if (task.creator_id !== requesterId) {
    throw new AppError("Only the task creator can delete this task.", 403);
  }

  return prisma.task.delete({
    where: { id: taskId },
  });
};


// *********** FILES SERVICES ***********
export const uploadTaskFile = async (userId: number, taskId: number, file: Express.Multer.File) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task)
    throw new AppError("Task not found", 404);

  const isMember = await prisma.teamUser.findFirst({
    where: {
      team_id: task.team_id,
      user_id: userId,
    },
  });

  if (!isMember)
    throw new AppError("Not a team member", 403);

  const savedFile = await prisma.file.create({
    data: {
      uploader_id: userId,
      task_id: taskId,
      team_id: task.team_id,
      file_name: file.originalname,
      file_url: `/api/uploads/tasks/${file.filename}`,
      file_type: file.mimetype,
      file_size: file.size,
    },
  });

  return prisma.file.findUnique({
    where: { id: savedFile.id },
      include: {
        uploader: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
          },
        },
      },
  });
};

export const getTaskFiles = async (taskId: number, userId: number) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task)
    throw new AppError("Task not found.", 404);

  const isMember = await prisma.teamUser.findFirst({
    where: {
      team_id: task.team_id,
      user_id: userId,
    },
  });

  if (!isMember)
    throw new AppError("Not a team member.", 403);

  return prisma.file.findMany({
    where: { task_id: taskId },
    orderBy: { created_at: "desc" },
    include: {
      uploader: {
        select: {
          id: true,
          username: true,
          avatar_url: true,
        },
      },
    },
  });
};

export const deleteFile = async (fileId: number, userId: number) => {
  const file = await prisma.file.findUnique({
    where: { id: fileId },
    include: {
      task: true,
    },
  });

  if (!file)
    throw new AppError("File not found.", 404);

  const isMember = await prisma.teamUser.findFirst({
    where: {
      team_id: file.task!.team_id,
      user_id: userId,
    },
  });

  if (!isMember)
    throw new AppError("Not a team member.", 403);

  const filename = path.basename(file.file_url);

  const filePath = path.join('/app/uploads/tasks', filename);
  
  fs.unlink(filePath, (err) => {
    if (err) console.error("File delete error:", err);
  });

  await prisma.file.delete({
    where: { id: fileId },
  });

  return { success: true };
};

export const downloadTaskFile = async (fileId: number, userId: number) => {
  const file = await prisma.file.findUnique({
    where: { id: fileId },
    include: { task: true },
  });

  if (!file)
    throw new AppError("File not found.", 404);

  if (!file.task)
    throw new AppError("File has no associated task.", 404);

  const isMember = await prisma.teamUser.findFirst({
    where: {
      team_id: file.task.team_id,
      user_id: userId,
    },
  });

  if (!isMember)
    throw new AppError("Not a team member.", 403);

  return file;
};
