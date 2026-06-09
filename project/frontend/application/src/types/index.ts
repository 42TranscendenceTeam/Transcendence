/**
 * TypeScript Type Definitions
 * 
 * Contains all TypeScript interfaces and types used
 * throughout the application for type safety.
 * 
 * Types:
 * - User: User profile data
 * - Team: Team entity with members and tasks
 * - Task: Task item with status
 * - Member: Team member with role
 * - Message: Chat message
 * - Friend: Friend relationship
 * - AuthContextType: Authentication context type
 * - TeamData: Team creation data
 */

export interface User {
  id: number;
  username: string;
  email: string;
  avatar: string;
  description?: string;
  twoFactorEnabled: boolean;
  friends: Friend[];
  teams: Team[];
  globalChat: Message[];
}

export interface Friend {
  id: number;
  username: string;
  avatar: string;
  chat: Message[];
  isOnline?: boolean;
}

export interface FriendRequest {
  request_id: number;
  status: 'pending' | 'accepted' | 'rejected';
  sent_at: string;
  user: { id: number; username: string; avatar_url: string };
}

export interface Team {
  id: number;
  name: string;
  objective: string;
  owner: User;
  role: string;
  status: string;
  members: Member[];
  tasks: Task[];
  chat: Message[];
}

export interface Member {
  id: number;
  username: string;
  avatar: string;
  role: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  assignedTo: Pick<User, 'id' | 'username'>[];
  files: TaskFile[];
  creatorId?: number;
}

export interface Message {
  id: number;
  text: string;
  sender: Pick<User, 'id' | 'username' | 'avatar'>;
  timestamp?: string;
}

export interface TaskFile {
  id: number;
  uploader_id: number;
  team_id: number | null;
  task_id: number | null;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
  uploader: { id: number; username: string; avatar_url: string };
}

export interface TeamData {
  name: string;
  description: string;
  lookingFor?: string;
  details?: string[];
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  toggle2FA: () => void;
  removeFriend: (friendId: number) => void;
  leaveTeam: (teamId: number) => void;
  addChatMessage: (teamId: number, message: Message) => void;
  sendFriendMessage: (friendId: number, message: Message) => void;
  sendGlobalMessage: (message: Message) => void;
  updateTaskStatus: (teamId: number, taskId: number, status: Task['status']) => void;
  addTask: (teamId: number, newTask: Partial<Task>) => void;
  uploadFile: (teamId: number, taskId: number, file: File) => Promise<void>;
  deleteTaskFile: (teamId: number, taskId: number, fileId: number) => Promise<void>;
  updateTaskAssignee: (teamId: number, taskId: number, members: Member[]) => void;
  addTeamMember: (teamId: number, member: Member, role: string) => void;
  addFriend: (friend: Friend) => void;
  findUserByUsername: (username: string) => User | undefined;
  removeTeamMember: (teamId: number, memberId: number) => void;
  createTeam: (teamData: TeamData) => void;
  updateTeamStatus: (teamId: number, status: string) => void;
  updateTeamSettings: (teamId: number, data: { name?: string; objective?: string; tags?: string[] }) => Promise<void>;
  notifications: AppNotification[];
  unreadCount: number;
  friendRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  friends: Friend[];
  teamInvites: TeamInvite[];
  joinRequestNotifications: JoinRequestNotification[];
  unreadNotifications: number;
  fetchNotifications: () => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: number) => void;
  deleteAllNotifications: () => void;
  fetchFriendRequests: () => void;
  fetchSentRequests: () => void;
  fetchFriends: () => void;
  fetchTeamInvites: () => void;
  teamRefreshTrigger: number;
  fetchJoinRequestNotifications: () => void;
  acceptFriendRequest: (requestId: number) => void;
  rejectFriendRequest: (requestId: number) => void;
  cancelSentFriendRequest: (requestId: number) => void;
  acceptTeamInvite: (inviteId: number) => void;
  rejectTeamInvite: (inviteId: number) => void;
  markNotificationsRead: () => void;
  onlineFriendIds: Set<number>;
}

export interface TeamInvite {
  invite_id: number;
  team_id: number;
  team_name: string;
  team_about: string;
  team_tags: string;
  team_max_users: number;
  sent_at: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface AppNotification {
  id: number;
  user_id_trigger: number | null;
  type: string;
  entity_id: number | null;
  entity_type: string | null;
  content: string | null;
  status_read: boolean;
  created_at: string;
}

export interface JoinRequestNotification {
  request_id: number;
  user_id: number;
  username: string;
  avatar_url: string;
  requested_at: string;
  team_id: number;
  team_name: string;
}