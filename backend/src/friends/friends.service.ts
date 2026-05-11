import { prisma } from '../prisma.js';
import { AppError } from '../utils/AppError.js';
import type { } from './friends.types.js';

// Returns friends list of logged-in user
export const getFriends = async (userId: number) => {

	const friendList = await prisma.friendship.findMany({
		where: {
			OR: [
				{ user_id_first: userId },
				{ user_id_second: userId },
			],
		},

		include: {
			user_first: {
				select: {
					id: true,
					username: true,
					avatar_url: true,
				},
			},
			user_second: {
				select: {
					id: true,
					username: true,
					avatar_url: true,
				},
			},
		},
	});

	return friendList.map((friendship) => {

		const friend = friendship.user_id_first === userId ? friendship.user_second : friendship.user_first;

		return {
			...friend,
			friends_since: friendship.friends_since,
		};
	});
};