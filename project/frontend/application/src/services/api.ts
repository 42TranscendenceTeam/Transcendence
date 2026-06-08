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
import { getAvatarUrl } from '../utils/avatar';
import type { TaskFile } from '../types';

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
  id: number;
  name: string;
  objective: string;
  owner: { id: number; username: string; avatar: string };
  role: string;
  status: string;
  members: Array<{ id: number; username: string; avatar: string; role: string }>;
  tags?: string[];
  maxUsers?: number;
  memberCount?: number;
  isMember?: boolean;
  created_at?: string;
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

export interface JoinRequest {
  request_id: number;
  user_id: number;
  username: string;
  avatar_url: string;
  requested_at: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
}

export interface Friend {
  id: number;
  username: string;
  avatar_url: string;
}

export interface UserProfileResponse {
  id: number;
  username: string;
  email: string;
  avatar_url: string;
  bio: string;
  friendCount: number;
  teamCount: number;
  activeTeams: number;
  finishedTeams: number;
  taskCount: number;
  tasksToDo: number;
  tasksInProgress: number;
  tasksDone: number;
}

export interface FriendRequest {
  request_id: number;
  status: 'pending' | 'accepted' | 'rejected';
  sent_at: string;
  user: { id: number; username: string; avatar_url: string };
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

  checkEmail(email: string): Promise<{ exists: boolean }> {
    return fetch(`${API_URL}/auth/check-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).then((response) => {
      if (!response.ok) {
        return response.json().then((error) => {
          throw new Error(error.error || 'Failed to check email');
        });
      }
      return response.json();
    });
  },

  verify2FA(tempToken: string, code: string): Promise<AuthResponse> {
    return fetch(`${API_URL}/auth/verify-2fa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ temp_token: tempToken, code }),
    }).then((response) => {
      if (!response.ok) {
        return response.json().then((error) => {
          throw new Error(error.error || 'Invalid verification code');
        });
      }
      return response.json();
    });
  },

  // ========== AVATAR UPLOAD ==========
  uploadAvatar(file: File): Promise<{ avatar_url: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    return fetch(`${API_URL}/users/me`, {
      method: 'PUT',
      headers: api.getAuthHeaders(),
      body: formData,
    }).then((response) => {
      if (!response.ok) {
        return response.json().then((data) => {
          throw new Error(data.error || 'Failed to upload avatar');
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

  // ========== OTHER USER PROFILE ==========
  getUserProfile(userId: number): Promise<UserProfileResponse> {
    return fetch(`${API_URL}/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
    }).then((response) => {
      if (!response.ok) {
        return response.json().then((error) => {
          throw new Error(error.error || 'Failed to get user profile');
        });
      }
      return response.json();
    });
  },

  // GET /users/:id/online - Returns user online status
  getUserOnline(userId: number): Promise<{ Online: boolean }> {
    return fetch(`${API_URL}/users/${userId}/online`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Failed to get user online status');
      }
      return response.json();
    });
  },

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
      avatar: getAvatarUrl(data.avatar_url),
      description: data.bio || '',
      twoFactorEnabled: data.two_factor_enabled || false,
      friends: [],
      teams: [],
      globalChat: [],
    }));
  },

  updateCurrentUser(data: Partial<UserProfile>): Promise<UserProfile> {
    return fetch(`${API_URL}/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
      body: JSON.stringify({
        username: data.username,
        email: data.email,
        bio: data.description,
      }),
    }).then((response) => {
      if (!response.ok) {
        return response.json().then((error) => {
          throw new Error(error.error || 'Failed to update profile');
        });
      }
      return response.json();
    }).then((data) => ({
      id: data.id,
      username: data.username,
      email: data.email,
      avatar: getAvatarUrl(data.avatar_url),
      description: data.bio || '',
      twoFactorEnabled: false,
    }));
  },

  // TODO: Implement - Backend needs to provide PUT /users/me/password
  updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    // Frontend sends: { currentPassword, newPassword }
    // Backend returns: nothing
    throw new Error('TODO: Implement PUT /users/me/password');
  },

  enable2FA(enable: boolean): Promise<{ two_factor_enabled: boolean }> {
    return fetch(`${API_URL}/users/2fa`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
      body: JSON.stringify({ enable }),
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Failed to update 2FA setting');
      }
      return response.json();
    });
  },

  // ========== TEAMS ==========
  getTeams(): Promise<Team[]> {
    const token = localStorage.getItem('authToken');
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    return fetch(`${API_URL}/teams`, {
      method: 'GET',
      headers,
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Failed to get teams');
      }
      return response.json();
    }).then(async (teams: any[]) => {
      const token = localStorage.getItem('authToken');
      let currentUserId: number | null = null;
      if (token) {
        try {
          const me = await api.getCurrentUser();
          currentUserId = Number(me.id);
        } catch { /* ignore */ }
      }

      return teams.map((team) => ({
        id: team.id,
        name: team.name,
        objective: team.about || '',
        owner: {
          id: team.owner?.id ?? 0,
          username: team.owner?.username ?? '',
          avatar: getAvatarUrl(team.owner?.avatar_url),
        },
        role: team.owner?.id === currentUserId ? 'Leader' : '',
        status: team.status_ongoing !== false ? 'active' : 'finished',
        members: [],
        tasks: [],
        chat: [],
        tags: team.tags ? team.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
        maxUsers: team.max_users || 10,
        memberCount: team._count?.team_users ?? 0,
        isMember: team.owner?.id === currentUserId,
        created_at: team.created_at,
      }));
    })
    .catch(() => []);
  },

  getMyTeams(): Promise<Team[]> {
    const token = localStorage.getItem('authToken');
    if (!token) return Promise.resolve([]);

    return fetch(`${API_URL}/teams`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    }).then((response) => {
      if (!response.ok) throw new Error('Failed to get teams');
      return response.json();
    }).then(async (teams: any[]) => {
      const me = await api.getCurrentUser().catch(() => null);
      if (!me) return [];

      const myTeams = await Promise.all(
        teams.map(async (team) => {
          const isOwner = team.owner?.id === Number(me.id);
          try {
            const membersRes = await fetch(`${API_URL}/teams/${team.id}/members`, {
              method: 'GET',
              headers: api.getAuthHeaders(),
            });
            const membersData = await membersRes.json();
            const memberList = membersData.member_list || [];
            const isMember = isOwner || memberList.some((m: { id: number }) => m.id === Number(me.id));

            if (!isMember) return null;

            return {
              id: team.id,
              name: team.name,
              objective: team.about || '',
              owner: {
                id: team.owner?.id ?? 0,
                username: team.owner?.username ?? '',
                avatar: getAvatarUrl(team.owner?.avatar_url),
              },
              role: isOwner ? 'Leader' : 'Member',
              status: team.status_ongoing !== false ? 'active' : 'finished',
              members: memberList.map((m: { id: number; username: string; avatar_url: string }) => ({
                id: m.id,
                username: m.username,
                avatar: getAvatarUrl(m.avatar_url),
                role: m.id === team.owner?.id ? 'Leader' : 'Member',
              })),
              tasks: [],
              chat: [],
              tags: team.tags ? team.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
              maxUsers: team.max_users || 10,
              memberCount: membersData.member_count || 0,
              isMember: true,
              created_at: team.created_at,
            };
          } catch {
            if (!isOwner) return null;
            return {
              id: team.id,
              name: team.name,
              objective: team.about || '',
              owner: {
                id: team.owner?.id ?? 0,
                username: team.owner?.username ?? '',
                avatar: getAvatarUrl(team.owner?.avatar_url),
              },
              role: 'Leader',
              status: team.status_ongoing !== false ? 'active' : 'finished',
              members: [],
              tasks: [],
              chat: [],
              tags: team.tags ? team.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
              maxUsers: team.max_users || 10,
              memberCount: 0,
              isMember: true,
              created_at: team.created_at,
            };
          }
        })
      );

      return myTeams.filter(Boolean);
    })
    .catch(() => []);
  },

  createTeam(data: { name: string; objective: string; maxUsers: number; tags: string[] }): Promise<Team> {
    return fetch(`${API_URL}/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
      body: JSON.stringify({
        name: data.name,
        about: data.objective,
        max_users: data.maxUsers,
        tags: data.tags.join(','),
      }),
    }).then((response) => {
      if (!response.ok) {
        return response.json().then((error) => {
          throw new Error(error.message || 'Failed to create team');
        });
      }
      return response.json();
    });
  },

  getTeam(teamId: number): Promise<Team & { memberCount: number }> {
    return fetch(`${API_URL}/teams/${teamId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Failed to get team');
      }
      return response.json();
    }).then(async (team) => {
      const membersRes = await fetch(`${API_URL}/teams/${teamId}/members`, {
        method: 'GET',
        headers: api.getAuthHeaders(),
      });
      const membersData = await membersRes.json();
      const memberList = membersData.member_list || [];
      const currentUser = await api.getCurrentUser();
      return {
        id: team.id,
        name: team.name,
        objective: team.about || '',
        owner: { id: team.owner_id, username: '', avatar: '' },
        role: team.owner_id === currentUser.id ? 'Leader' : 'Member',
        status: team.status_ongoing ? 'active' : 'finished',
        members: memberList.map((m: { id: number; username: string; avatar_url: string }) => ({
          id: m.id,
          username: m.username,
          avatar: getAvatarUrl(m.avatar_url),
          role: m.id === team.owner_id ? 'Leader' : 'Member',
        })),
        tags: team.tags ? team.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
        maxUsers: team.max_users,
        memberCount: membersData.member_count || 0,
        isMember: true,
        created_at: team.created_at,
      };
    });
  },

  updateTeam(teamId: number, data: { name?: string; objective?: string; tags?: string[]; status?: string }): Promise<any> {
    return fetch(`${API_URL}/teams/${teamId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
      body: JSON.stringify({
        ...(data.name !== undefined && { name: data.name }),
        ...(data.objective !== undefined && { about: data.objective }),
        ...(data.tags !== undefined && { tags: data.tags.join(',') }),
        ...(data.status !== undefined && { status_ongoing: data.status === 'active' }),
      }),
    }).then((response) => {
      if (!response.ok) {
        return response.json().then((error) => {
          throw new Error(error.message || 'Failed to update team');
        });
      }
      return response.json();
    });
  },

  deleteTeam(teamId: number): Promise<void> {
    return fetch(`${API_URL}/teams/${teamId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Failed to delete team');
      }
    });
  },

  leaveTeam(teamId: number): Promise<void> {
    return fetch(`${API_URL}/teams/${teamId}/leave`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
    }).then((response) => {
      if (!response.ok) {
        return response.json().then((error) => {
          throw new Error(error.message || 'Failed to leave team');
        });
      }
    });
  },

  removeTeamMember(teamId: number, memberId: number): Promise<void> {
    return fetch(`${API_URL}/teams/${teamId}/members/${memberId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
    }).then((response) => {
      if (!response.ok) {
        return response.json().then((error) => {
          throw new Error(error.message || 'Failed to remove team member');
        });
      }
    });
  },

  // ========== JOIN REQUESTS ==========
  sendJoinRequest(teamId: number): Promise<JoinRequest> {
    return fetch(`${API_URL}/teams/${teamId}/join-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
    }).then((response) => {
      if (!response.ok) {
        return response.json().then((error) => {
          throw new Error(error.error || error.message || 'Failed to send join request');
        });
      }
      return response.json();
    });
  },

  getJoinRequests(teamId: number): Promise<{ request_list: JoinRequest[]; request_count: number }> {
    return fetch(`${API_URL}/teams/${teamId}/join-requests`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
    }).then((response) => {
      if (!response.ok) {
        return response.json().then((error) => {
          throw new Error(error.error || error.message || 'Failed to get join requests');
        });
      }
      return response.json();
    });
  },

  acceptJoinRequest(teamId: number, requestId: number): Promise<void> {
    return fetch(`${API_URL}/teams/${teamId}/join-requests/${requestId}/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
    }).then((response) => {
      if (!response.ok) {
        return response.json().then((error) => {
          throw new Error(error.error || error.message || 'Failed to accept join request');
        });
      }
    });
  },

  rejectJoinRequest(teamId: number, requestId: number): Promise<void> {
    return fetch(`${API_URL}/teams/${teamId}/join-requests/${requestId}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
    }).then((response) => {
      if (!response.ok) {
        return response.json().then((error) => {
          throw new Error(error.error || error.message || 'Failed to reject join request');
        });
      }
    });
  },

  // ========== TEAM INVITES ==========
  getTeamInvites(): Promise<TeamInvite[]> {
    return fetch(`${API_URL}/teams/invites`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
    }).then((response) => {
      if (!response.ok) {
        return response.json().then((error) => {
          throw new Error(error.error || error.message || 'Failed to get team invites');
        });
      }
      return response.json();
    });
  },

  acceptTeamInvite(inviteId: number): Promise<void> {
    return fetch(`${API_URL}/teams/invites/${inviteId}/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
    }).then((response) => {
      if (!response.ok) {
        return response.json().then((error) => {
          throw new Error(error.error || error.message || 'Failed to accept team invite');
        });
      }
    });
  },

  rejectTeamInvite(inviteId: number): Promise<void> {
    return fetch(`${API_URL}/teams/invites/${inviteId}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
    }).then((response) => {
      if (!response.ok) {
        return response.json().then((error) => {
          throw new Error(error.error || error.message || 'Failed to reject team invite');
        });
      }
    });
  },

  sendTeamInvite(teamId: number, receiverId: number): Promise<void> {
    return fetch(`${API_URL}/teams/${teamId}/invites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
      body: JSON.stringify({ receiverId }),
    }).then((response) => {
      if (!response.ok) {
        return response.json().then((error) => {
          throw new Error(error.error || error.message || 'Failed to send team invite');
        });
      }
    });
  },

  getTeamMembers(teamId: number): Promise<{ member_list: Array<{ id: number; username: string; avatar_url: string }> }> {
    return fetch(`${API_URL}/teams/${teamId}/members`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Failed to get team members');
      }
      return response.json();
    });
  },

  getTeamInvitesSent(teamId: number): Promise<{ invite_id: number; sent_at: string; user_id: number }[]> {
    return fetch(`${API_URL}/teams/${teamId}/invites-sent`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Failed to get team invites sent');
      }
      return response.json();
    });
  },

  // ========== TASKS ==========
  mapBackendTask(task: any): Task {
    return {
      id: task.id,
      title: task.title,
      description: task.description || '',
      status: task.status,
      assignedTo: (task.task_users || []).map((tu: any) => ({
        id: tu.user.id,
        username: tu.user.username,
      })),
      files: (task.files || []).map((f: any) => ({
        id: f.id,
        uploader_id: f.uploader_id,
        team_id: f.team_id,
        task_id: f.task_id,
        file_name: f.file_name,
        file_url: f.file_url,
        file_type: f.file_type,
        file_size: f.file_size,
        created_at: f.created_at,
        uploader: f.uploader,
      })),
      creatorId: task.creator_id,
    };
  },

  getTasks(teamId: number): Promise<Task[]> {
    return fetch(`${API_URL}/teams/${teamId}/tasks`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
    }).then((response) => {
      if (!response.ok) throw new Error('Failed to get tasks');
      return response.json();
    }).then((tasks: any[]) =>
      tasks.map((t) => api.mapBackendTask(t))
    );
  },

  createTask(teamId: number, data: { title: string; description: string; status?: Task['status']; user_ids?: number[] }): Promise<Task> {
    return fetch(`${API_URL}/teams/${teamId}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
      body: JSON.stringify({
        title: data.title,
        description: data.description,
        ...(data.status && { status: data.status }),
        ...(data.user_ids !== undefined && { user_ids: data.user_ids }),
      }),
    }).then((response) => {
      if (!response.ok) {
        return response.json().then((error) => {
          throw new Error(error.error || 'Failed to create task');
        });
      }
      return response.json();
    }).then((task) => api.mapBackendTask(task));
  },

  getTask(taskId: number): Promise<Task> {
    return fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
    }).then((response) => {
      if (!response.ok) throw new Error('Failed to get task');
      return response.json();
    }).then((task) => api.mapBackendTask(task));
  },

  updateTaskStatus(taskId: number, status: Task['status']): Promise<Task> {
    return fetch(`${API_URL}/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
      body: JSON.stringify({ status }),
    }).then((response) => {
      if (!response.ok) {
        return response.json().then((error) => {
          throw new Error(error.error || 'Failed to update task status');
        });
      }
      return response.json();
    }).then((task) => api.mapBackendTask(task));
  },

  updateTaskUsers(taskId: number, userIds: number[]): Promise<void> {
    return fetch(`${API_URL}/tasks/${taskId}/users`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
      body: JSON.stringify({ user_ids: userIds }),
    }).then((response) => {
      if (!response.ok) {
        return response.json().then((error) => {
          throw new Error(error.error || 'Failed to update task users');
        });
      }
    });
  },

  deleteTask(taskId: number): Promise<void> {
    return fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
    }).then((response) => {
      if (!response.ok) {
        return response.json().then((error) => {
          throw new Error(error.error || 'Failed to delete task');
        });
      }
    });
  },

  // ========== TASK FILES ==========
  uploadTaskFile(taskId: number, file: File): Promise<TaskFile> {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${API_URL}/tasks/${taskId}/files`, {
      method: 'POST',
      headers: api.getAuthHeaders(),
      body: formData,
    }).then((response) => {
      if (!response.ok) {
        return response.json().then((data) => {
          throw new Error(data.error || 'Failed to upload file');
        });
      }
      return response.json();
    });
  },

  getTaskFiles(taskId: number): Promise<TaskFile[]> {
    return fetch(`${API_URL}/tasks/${taskId}/files`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
    }).then((response) => {
      if (!response.ok) throw new Error('Failed to get task files');
      return response.json();
    });
  },

  deleteTaskFile(fileId: number): Promise<void> {
    return fetch(`${API_URL}/tasks/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        ...api.getAuthHeaders(),
      },
    }).then((response) => {
      if (!response.ok) {
        return response.json().then((data) => {
          throw new Error(data.error || 'Failed to delete file');
        });
      }
    });
  },

  // ========== FRIENDS ==========
  // GET /friends - Returns current user's friends
  // Response: { id, username, avatar_url, friends_since }
  getFriends(): Promise<Friend[]> {
    return fetch(`${API_URL}/friends`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Failed to get friends');
      }
      return response.json().then((data) =>
        data.map((friend: { id: number; username: string; avatar_url: string }) => ({
          id: friend.id,
          username: friend.username,
          avatar: getAvatarUrl(friend.avatar_url),
        }))
      );
    });
  },

  // POST /friends/requests - Creates a new friend request with receiver ID
  // Body: { receiverId: number }
  addFriend(receiverId: number): Promise<void> {
    return fetch(`${API_URL}/friends/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
      body: JSON.stringify({ receiverId }),
    }).then((response) => {
      if (!response.ok) {
        return response.json().then((error) => {
          throw new Error(error.error || 'Failed to send friend request');
        });
      }
      return response.json();
    });
  },

  // DELETE /friends/:friendId - Removes a friend using the friend user ID
  removeFriend(friendId: number): Promise<void> {
    return fetch(`${API_URL}/friends/${friendId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Failed to remove friend');
      }
    });
  },

  // GET /friends/requests/received - Returns pending friend requests received
  // Response: { request_id, status, sent_at, user: {id, username, avatar_url} }
  getFriendRequests(): Promise<FriendRequest[]> {
    return fetch(`${API_URL}/friends/requests/received`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Failed to get friend requests');
      }
      return response.json();
    });
  },

  // POST /friends/requests/:id/accept - Accepts a pending friend request
  acceptFriendRequest(requestId: number): Promise<void> {
    return fetch(`${API_URL}/friends/requests/${requestId}/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Failed to accept friend request');
      }
    });
  },

  // POST /friends/requests/:id/reject - Rejects a pending friend request
  rejectFriendRequest(requestId: number): Promise<void> {
    return fetch(`${API_URL}/friends/requests/${requestId}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Failed to reject friend request');
      }
    });
  },

  // DELETE /friends/requests/:id - Cancels a sent friend request
  cancelFriendRequest(requestId: number): Promise<void> {
    return fetch(`${API_URL}/friends/requests/${requestId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Failed to cancel friend request');
      }
    });
  },

  // GET /friends/requests/sent - Returns pending friend requests sent
  // Response: { request_id, status, sent_at, user: {id, username, avatar_url} }
  getSentFriendRequests(): Promise<FriendRequest[]> {
    return fetch(`${API_URL}/friends/requests/sent`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Failed to get sent friend requests');
      }
      return response.json();
    });
  },

  // ========== NOTIFICATIONS ==========
  getNotifications(): Promise<AppNotification[]> {
    return fetch(`${API_URL}/notifications`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Failed to get notifications');
      }
      return response.json();
    });
  },

  getUnreadNotifications(): Promise<AppNotification[]> {
    return fetch(`${API_URL}/notifications/unread`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Failed to get unread notifications');
      }
      return response.json();
    });
  },

  readNotification(id: number): Promise<AppNotification> {
    return fetch(`${API_URL}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
    }).then((response) => {
      if (!response.ok) {
        return response.json().then((error) => {
          throw new Error(error.error || 'Failed to mark notification as read');
        });
      }
      return response.json();
    });
  },

  readAllNotifications(): Promise<{ count: number }> {
    return fetch(`${API_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
      return response.json();
    });
  },

  deleteNotification(id: number): Promise<AppNotification> {
    return fetch(`${API_URL}/notifications/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
    }).then((response) => {
      if (!response.ok) {
        return response.json().then((error) => {
          throw new Error(error.error || 'Failed to delete notification');
        });
      }
      return response.json();
    });
  },

  deleteAllNotifications(): Promise<void> {
    return fetch(`${API_URL}/notifications`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Failed to delete all notifications');
      }
    });
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