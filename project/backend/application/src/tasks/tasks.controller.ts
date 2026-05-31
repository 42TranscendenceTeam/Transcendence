import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import type { CreateTaskDTO } from './tasks.types.js';
import { AppError } from '../utils/AppError.js';
import { createTask, getTeamTasks,  getTask, updateTaskStatus, updateTaskUsers, deleteTask, uploadTaskFile, getTaskFiles, deleteFile, downloadTaskFile } from './tasks.service.js';

export const createTaskController = async (req: AuthRequest, res: Response) => {
  const teamId = Number(req.params.id);

  if (Number.isNaN(teamId))
    throw new AppError("Invalid team ID.", 400);

  const data: CreateTaskDTO = req.body;

  if (!data.title || !data.description)
    throw new AppError("Title and description are required.", 400);

  const requesterId = req.user!.id;

  const task = await createTask(requesterId, teamId, data);

  return res.status(201).json(task);
};

export const getTeamTasksController = async (req: AuthRequest, res: Response) => {
  const teamId = Number(req.params.id);

  if (Number.isNaN(teamId))
    throw new AppError("Invalid team ID.", 400);

  const requesterId = req.user!.id;

  const tasks = await getTeamTasks(teamId, requesterId);

  return res.json(tasks);
};

export const getTaskController = async (req: AuthRequest, res: Response) => {
  const taskId = Number(req.params.id);

  if (Number.isNaN(taskId))
    throw new AppError("Invalid task ID.", 400);

  const requesterId = req.user!.id;

  const task = await getTask(taskId, requesterId);

  return res.json(task);
};

export const updateTaskStatusController = async (req: AuthRequest, res: Response) => {
  const taskId = Number(req.params.id);
  const { status } = req.body;

  if (Number.isNaN(taskId))
    throw new AppError("Invalid task ID.", 400);

  if (!status)
    throw new AppError("Status is required.", 400);

  const requesterId = req.user!.id;

  const updated = await updateTaskStatus(taskId, requesterId, status);

  return res.json(updated);
};

export const updateTaskUsersController = async (req: AuthRequest, res: Response) => {
  const taskId = Number(req.params.id);
  const { user_ids } = req.body;

  if (Number.isNaN(taskId))
    throw new AppError("Invalid task ID.", 400);

  if (!Array.isArray(user_ids))
    throw new AppError("user_ids must be an array.", 400);

  const requesterId = req.user!.id;

  const updated = await updateTaskUsers(taskId, requesterId, user_ids);

  return res.json(updated);
};

export const deleteTaskController = async (req: AuthRequest, res: Response) => {
  const taskId = Number(req.params.id);
  const requesterId = req.user!.id;

  if (Number.isNaN(taskId))
    throw new AppError("Invalid task ID.", 400);

  const result = await deleteTask(taskId, requesterId);

  return res.json(result);
};

// *********** FILES CONTROLLERS ***********
export const uploadTaskFileController = async (req: AuthRequest, res: Response) => {
  const taskId = Number(req.params.id);
  const requesterId = req.user!.id;

  if (Number.isNaN(taskId))
    throw new AppError("Invalid task ID.", 400);

  if (!req.file)
    throw new AppError("File is required.", 400);

  const file = await uploadTaskFile(requesterId, taskId, req.file);

  return res.status(201).json(file);
};

export const getTaskFilesController = async (req: AuthRequest, res: Response) => {
  const taskId = Number(req.params.id);
  const requesterId = req.user!.id;

  if (Number.isNaN(taskId))
    throw new AppError("Invalid task ID.", 400);

  const files = await getTaskFiles(taskId, requesterId);

  return res.json(files);
};

export const deleteFileController = async (req: AuthRequest, res: Response) => {
  const fileId = Number(req.params.id);

  if (Number.isNaN(fileId))
    throw new AppError("Invalid file ID.", 400);

  const result = await deleteFile(fileId, req.user!.id);

  return res.json(result);
};

export const downloadFileController = async (req: AuthRequest, res: Response) => {
  const fileId = Number(req.params.id);

  if (Number.isNaN(fileId))
    throw new AppError("Invalid file ID.", 400);

  const file = await downloadTaskFile(fileId, req.user!.id);

  const filePath = `/app/uploads/tasks/${file.file_url.split('/').pop()}`;

  const fileName = file.file_name;

  res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
  res.setHeader('Content-Type', file.file_type || 'application/octet-stream');

  res.sendFile(filePath);
};