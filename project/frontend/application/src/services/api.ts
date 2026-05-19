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
  status: 'to_do' | 'in_progress' | 'done';
}

export interface Friend {
  id: number;
  username: string;
  avatar_url: string;
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
  getTeams(): Promise<Team[]> {
    return fetch(`${API_URL}/teams`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
      },
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Failed to get teams');
      }
      return response.json();
    }).then(async (teams) => {
      const currentUser = await api.getCurrentUser();
      const teamsWithMembers = await Promise.all(
        teams.map(async (team: { id: number; name: string; about: string | null; tags: string | null; max_users: number }) => {
          try {
            const membersRes = await fetch(`${API_URL}/teams/${team.id}/members`, {
              method: 'GET',
              headers: api.getAuthHeaders(),
            });
            const membersData = await membersRes.json();
            const memberList = membersData.member_list || [];
            const isMember = memberList.some((m: { id: number }) => m.id === currentUser.id);
            const ownerRes = await fetch(`${API_URL}/teams/${team.id}`, {
              method: 'GET',
              headers: api.getAuthHeaders(),
            });
            const ownerData = await ownerRes.json();
            return {
              id: team.id,
              name: team.name,
              objective: team.about || '',
              owner: { id: ownerData.owner_id, username: '', avatar: '' },
              role: ownerData.owner_id === currentUser.id ? 'Leader' : (isMember ? 'Member' : ''),
              status: ownerData.status_ongoing ? 'active' : 'finished',
              members: memberList.map((m: { id: number; username: string; avatar_url: string }) => ({
                id: m.id,
                username: m.username,
                avatar: m.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.username}`,
                role: m.id === ownerData.owner_id ? 'Leader' : 'Member',
              })),
              tags: team.tags ? team.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
              maxUsers: team.max_users,
              memberCount: membersData.member_count || 0,
              isMember,
              created_at: team.created_at,
            };
          } catch {
            return {
              id: team.id,
              name: team.name,
              objective: team.about || '',
              owner: { id: 0, username: '', avatar: '' },
              role: '',
              status: 'active',
              members: [],
              tags: team.tags ? team.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
              maxUsers: team.max_users,
              memberCount: 0,
              isMember: false,
              created_at: team.created_at,
            };
          }
        })
      );
      return teamsWithMembers;
    });
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
          avatar: m.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.username}`,
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
        name: data.name,
        about: data.objective,
        tags: data.tags?.join(','),
        status_ongoing: data.status === 'active',
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
          throw new Error(error.message || 'Failed to send join request');
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
          throw new Error(error.message || 'Failed to get join requests');
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
          throw new Error(error.message || 'Failed to accept join request');
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
          throw new Error(error.message || 'Failed to reject join request');
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
          throw new Error(error.message || 'Failed to get team invites');
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
          throw new Error(error.message || 'Failed to accept team invite');
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
          throw new Error(error.message || 'Failed to reject team invite');
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
          throw new Error(error.message || 'Failed to send team invite');
        });
      }
    });
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
          avatar: friend.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.username}`,
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