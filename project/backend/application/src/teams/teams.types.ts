export type CreateTeamDTO = {
	name: string;
	max_users: number;
	about?: string;
	tags?: string;
};