import { AppError } from '../utils/AppError.js';
import { prisma } from '../prisma.js';
import { getIO } from '../socket.js';

// Returns all notifications of logged-in user
export const getNotifications = async (userId: number) => {

	const notifications = await prisma.notification.findMany({
		where: {
			user_id_receiver: userId,
		},
		orderBy: {
			created_at: 'desc',
		},
		select: {
			id: true,
			user_id_trigger: true,
			type: true,
			entity_id: true,
			entity_type: true,
			content: true,
			status_read: true,
			created_at: true,
		},
	});

	return notifications;
};

// Returns only unread notifications of logged-in user
export const getUnreadNotifications = async (userId: number) => {

	const notifications = await prisma.notification.findMany({
		where: {
			user_id_receiver: userId,
			status_read: false,
		},
		orderBy: {
			created_at: 'desc',
		},
		select: {
			id: true,
			user_id_trigger: true,
			type: true,
			entity_id: true,
			entity_type: true,
			content: true,
			status_read: true,
			created_at: true,
		},
	});

	return notifications;
};

// Reads a specific notification with id
export const readNotification = async (userId: number, notificationId: number) => {

	const notification = await prisma.notification.findFirst({
		where: {
			id: notificationId,
			user_id_receiver: userId,
			status_read: false,
		},
	});

	if (!notification)
		throw new AppError("Notification not found.", 404);

	return prisma.notification.update({
		where: {
			id: notification.id,
		},
		data: {
			status_read: true,
		}
	});
};

// Reads all notifications for logged-in user
export const readAllNotifications = async (userId: number) => {

	return prisma.notification.updateMany({
		where: {
			user_id_receiver: userId,
			status_read: false,
		},
		data: {
			status_read: true,
		}
	});
};

// Deletes a specific notification with id
export const deleteNotification = async (userId: number, notificationId: number) => {


	const notification = await prisma.notification.findFirst({
		where: {
			id: notificationId,
			user_id_receiver: userId,
		},
	});

	if (!notification)
		throw new AppError("Notification not found.", 404);

	return prisma.notification.delete({
		where: {
			id: notification.id,
		}
	});
};

// Create notifications helper function for all services
export const createNotification = async (
	userIdReceiver: number,
	type: string,
	entityId?: number,
	entityType?: string,
	userIdTrigger?: number,
	content?: string,

) => {
	const notification = await prisma.notification.create({
		data: {
			user_id_receiver: userIdReceiver,
			user_id_trigger: userIdTrigger ?? null,
			type: type,
			content: content ?? null,
			entity_id: entityId ?? null,
			entity_type: entityType ?? null,
		},
	});

	const io = getIO();
	io.to(`user:${userIdReceiver}`).emit('notification:new', notification);
	return notification;
};
