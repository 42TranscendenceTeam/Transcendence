import { AppError } from '../utils/AppError.js';
import { prisma } from '../prisma.js';

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
