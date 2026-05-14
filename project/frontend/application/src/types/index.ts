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
  status: 'to_do' | 'in_progress' | 'done';
  assignedTo: Pick<User, 'id' | 'username'> | null;
  files: FileAttachment[];
}

export interface Message {
  id: number;
  text: string;
  sender: Pick<User, 'id' | 'username' | 'avatar'>;
  timestamp?: string;
}

export interface FileAttachment {
  name: string;
  size: string;
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
  uploadFile: (teamId: number, taskId: number, file: File) => void;
  updateTaskAssignee: (teamId: number, taskId: number, member: Member) => void;
  addTeamMember: (teamId: number, member: Member, role: string) => void;
  addFriend: (friend: Friend) => void;
  findUserByUsername: (username: string) => User | undefined;
  removeTeamMember: (teamId: number, memberId: number) => void;
  createTeam: (teamData: TeamData) => void;
  updateTeamStatus: (teamId: number, status: string) => void;
  friendRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  friends: Friend[];
  fetchFriendRequests: () => void;
  fetchSentRequests: () => void;
  fetchFriends: () => void;
  acceptFriendRequest: (requestId: number) => void;
  rejectFriendRequest: (requestId: number) => void;
}