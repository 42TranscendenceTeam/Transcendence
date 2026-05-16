import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { AppError } from '../utils/AppError.js';
import { getNotifications, getUnreadNotifications, readNotification } from './notifications.service.js';

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
