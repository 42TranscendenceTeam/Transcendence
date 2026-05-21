import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { AppError } from '../utils/AppError.js';
import { getNotifications, getUnreadNotifications, readNotification, readAllNotifications, deleteNotification, deleteAllNotifications } from './notifications.service.js';

export const getNotificationsController = async (req: AuthRequest, res: Response) => {
	const notifications = await getNotifications(req.user!.id);
	return res.json(notifications);
};

export const getUnreadNotificationsController = async (req: AuthRequest, res: Response) => {
	const notifications = await getUnreadNotifications(req.user!.id);
	return res.json(notifications);
};

export const readNotificationController = async (req: AuthRequest, res: Response) => {
	const notificationId = Number(req.params.id);

	if (!notificationId || Number.isNaN(Number(notificationId)))
		throw new AppError("Mandatory valid notification ID.", 400);

	const notification = await readNotification(req.user!.id, notificationId);
	return res.json(notification);
};

export const readAllNotificationsController = async (req: AuthRequest, res: Response) => {
	const notifications = await readAllNotifications(req.user!.id);
	return res.json(notifications);
};

export const deleteNotificationController = async (req: AuthRequest, res: Response) => {
	const notificationId = Number(req.params.id);

	if (!notificationId || Number.isNaN(Number(notificationId)))
		throw new AppError("Mandatory valid notification ID.", 400);

	const notification = await deleteNotification(req.user!.id, notificationId);
	return res.json(notification);
};

export const deleteAllNotificationsController = async (req: AuthRequest, res: Response) => {
	const notifications = await deleteAllNotifications(req.user!.id);
	return res.json(notifications);
};
