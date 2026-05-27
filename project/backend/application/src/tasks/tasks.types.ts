export interface CreateTaskDTO {
  title: string;
  description: string;
  status?: 'open' | 'in_progress' | 'closed';
  user_ids?: number[];
}
