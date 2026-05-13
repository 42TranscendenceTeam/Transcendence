/**
 * API Client Service
 * 
 * Provides centralized API communication with the backend server.
 * Handles authentication (register, login) and TODO placeholders for
 * all other backend endpoints.
 * 
 * Base URL: Configured via VITE_API_URL environment variable
 * 
 * Implemented:
 * - api.register() - POST /auth/register
 * - api.login() - POST /auth/login
 * 
 * TODO (placeholders):
 * - User profile: getCurrentUser, updateCurrentUser
 * - Teams: getTeams, createTeam, getTeam
 * - Tasks: getTasks, createTask, updateTask
 * - Friends: getFriends, addFriend, removeFriend
 * - Messages: getTeamMessages, sendTeamMessage
 */

/*
 *  API URL for Production or Development
 *  Uses relative path for nginx proxy, falls back to localhost for development
 */
const API_URL = import.meta.env.VITE_API_URL || '/api';

/*
 *  Exports to define what shape data must have.
 *  Example, "LoginRequest" must have email and password strings.
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
  };
  token: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar: string;
  description: string;
  twoFactorEnabled: boolean;
}

export interface Team {
  id: string;
  name: string;
  objective: string;
  owner: { id: string; username: string; avatar: string };
  role: string;
  status: string;
  members: Array<{ id: string; username: string; avatar: string; role: string }>;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'to_do' | 'in_progress' | 'done';
}

export interface Friend {
  id: string;
  username: string;
  avatar: string;
}

/*
 *  api has all methods to interact with backend.
 *  we can simply export "api" and call different methods with ex: "api.login()"
 */

/*
 *  //Promise - return a promisse that resolves to an AuthResponse object;
 *  //fetch - to make the request to the backend;
 *  //error handling - since the response is a promisse, at least an error must be returned
 */
export const api = {
  // ========== AUTH ==========
  register(data: RegisterRequest): Promise<AuthResponse> {
    return fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((response) => {
      if (!response.ok) {
        return response.json().then((error) => {
          throw new Error(error.error || 'Registration failed');
        });
      }
      return response.json();
    });
  },

  login(data: LoginRequest): Promise<AuthResponse> {
    return fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((response) => {
      if (!response.ok) {
        return response.json().then((error) => {
          throw new Error(error.error || 'Login failed');
        });
      }
      return response.json();
    });
  },

  // ========== USER SEARCH ==========
  searchUsers(query: string): Promise<{id: number, username: string}[]> {
    return fetch(`${API_URL}/users/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Failed to search users');
      }
      return response.json();
    });
  },

  // TODO: Define wich methos will require "getAuthHeaders" and wich don't
  // ========== USER PROFILE ==========
  getCurrentUser(): Promise<UserProfile> {
    return fetch(`${API_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Failed to get current user');
      }
      return response.json();
    }).then((data) => ({
      id: data.id,
      username: data.username,
      email: data.email,
      avatar: data.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
      description: data.bio || '',
      twoFactorEnabled: false,
      friends: [],
      teams: [],
      globalChat: [],
    }));
  },

  // TODO: Implement - Backend needs to provide PUT /users/me
  updateCurrentUser(data: Partial<UserProfile>): Promise<UserProfile> {
    // Frontend sends: { username?, avatar?, description? }
    // Backend returns: { id, username, email, avatar, description, twoFactorEnabled }
    throw new Error('TODO: Implement PUT /users/me');
  },

  // TODO: Implement - Backend needs to provide PUT /users/me/password
  updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    // Frontend sends: { currentPassword, newPassword }
    // Backend returns: nothing
    throw new Error('TODO: Implement PUT /users/me/password');
  },

  // TODO: Implement - Backend needs to provide POST /users/me/2fa
  enable2FA(enable: boolean): Promise<void> {
    // Frontend sends: { enable: boolean }
    // Backend returns: nothing
    throw new Error('TODO: Implement POST /users/me/2fa');
  },

  // ========== TEAMS ==========
  // TODO: Implement - Backend needs to provide GET /teams
  getTeams(): Promise<Team[]> {
    // Frontend sends: nothing (uses token)
    // Backend returns: Array of { id, name, objective, owner, role, status, members }
    throw new Error('TODO: Implement GET /teams');
  },

  // TODO: Implement - Backend needs to provide POST /teams
  createTeam(data: { name: string; objective: string }): Promise<Team> {
    // Frontend sends: { name, objective }
    // Backend returns: { id, name, objective, owner, role, status, members }
    throw new Error('TODO: Implement POST /teams');
  },

  // TODO: Implement - Backend needs to provide GET /teams/:id
  getTeam(teamId: string): Promise<Team> {
    // Frontend sends: nothing
    // Backend returns: { id, name, objective, owner, role, status, members, tasks }
    throw new Error('TODO: Implement GET /teams/:id');
  },

  // TODO: Implement - Backend needs to provide PUT /teams/:id
  updateTeam(teamId: string, data: Partial<Team>): Promise<Team> {
    // Frontend sends: { name?, objective?, status? }
    // Backend returns: { id, name, objective, owner, role, status, members }
    throw new Error('TODO: Implement PUT /teams/:id');
  },

  // TODO: Implement - Backend needs to provide DELETE /teams/:id
  deleteTeam(teamId: string): Promise<void> {
    // Frontend sends: nothing
    // Backend returns: nothing
    throw new Error('TODO: Implement DELETE /teams/:id');
  },

  // TODO: Implement - Backend needs to provide POST /teams/:id/members
  addTeamMember(teamId: string, userId: string, role: string): Promise<void> {
    // Frontend sends: { userId, role }
    // Backend returns: nothing
    throw new Error('TODO: Implement POST /teams/:id/members');
  },

  // TODO: Implement - Backend needs to provide DELETE /teams/:id/members/:userId
  removeTeamMember(teamId: string, userId: string): Promise<void> {
    // Frontend sends: nothing
    // Backend returns: nothing
    throw new Error('TODO: Implement DELETE /teams/:id/members/:userId');
  },

  // ========== TASKS ==========
  // TODO: Implement - Backend needs to provide GET /teams/:id/tasks
  getTasks(teamId: string): Promise<Task[]> {
    // Frontend sends: nothing
    // Backend returns: Array of { id, title, description, status, assignedTo }
    throw new Error('TODO: Implement GET /teams/:id/tasks');
  },

  // TODO: Implement - Backend needs to provide POST /teams/:id/tasks
  createTask(teamId: string, data: { title: string; description: string }): Promise<Task> {
    // Frontend sends: { title, description }
    // Backend returns: { id, title, description, status }
    throw new Error('TODO: Implement POST /teams/:id/tasks');
  },

  // TODO: Implement - Backend needs to provide PUT /teams/:id/tasks/:taskId
  updateTask(teamId: string, taskId: string, data: Partial<Task>): Promise<Task> {
    // Frontend sends: { title?, description?, status?, assignedTo? }
    // Backend returns: { id, title, description, status }
    throw new Error('TODO: Implement PUT /teams/:id/tasks/:taskId');
  },

  // TODO: Implement - Backend needs to provide DELETE /teams/:id/tasks/:taskId
  deleteTask(teamId: string, taskId: string): Promise<void> {
    // Frontend sends: nothing
    // Backend returns: nothing
    throw new Error('TODO: Implement DELETE /teams/:id/tasks/:taskId');
  },

  // ========== FRIENDS ==========
  // TODO: Implement - Backend needs to provide GET /friends
  getFriends(): Promise<Friend[]> {
    // Frontend sends: nothing
    // Backend returns: Array of { id, username, avatar }
    throw new Error('TODO: Implement GET /friends');
  },

  // TODO: Implement - Backend needs to provide POST /friends
  addFriend(username: string): Promise<Friend> {
    // Frontend sends: { username }
    // Backend returns: { id, username, avatar }
    throw new Error('TODO: Implement POST /friends');
  },

  // TODO: Implement - Backend needs to provide DELETE /friends/:id
  removeFriend(friendId: string): Promise<void> {
    // Frontend sends: nothing
    // Backend returns: nothing
    throw new Error('TODO: Implement DELETE /friends/:id');
  },

  // TODO: Implement - Backend needs to provide GET /friends/requests
  getFriendRequests(): Promise<Friend[]> {
    // Frontend sends: nothing
    // Backend returns: Array of incoming friend requests { id, username, avatar }
    throw new Error('TODO: Implement GET /friends/requests');
  },

  // ========== MESSAGES ==========
  // TODO: Implement - Backend needs to provide GET /teams/:id/messages
  getTeamMessages(teamId: string): Promise<any[]> {
    // Frontend sends: nothing
    // Backend returns: Array of messages { id, sender, content, timestamp }
    throw new Error('TODO: Implement GET /teams/:id/messages');
  },

  // TODO: Implement - Backend needs to provide POST /teams/:id/messages
  sendTeamMessage(teamId: string, content: string): Promise<any> {
    // Frontend sends: { content }
    // Backend returns: { id, sender, content, timestamp }
    throw new Error('TODO: Implement POST /teams/:id/messages');
  },

  // ========== UTILITIES ==========
  getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};