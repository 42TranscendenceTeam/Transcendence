export type CreateTeamDTO = {
	name: string;
	max_users: number;
	about?: string;
	tags?: string;
};

export type UpdateTeamDTO = {
	name: string;
	about?: string;
	tags?: string;
	status_ongoing: boolean;
};
