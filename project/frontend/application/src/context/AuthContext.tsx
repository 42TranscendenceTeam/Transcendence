/**
 * Authentication Context Provider
 * 
 * Manages user authentication state and provides authentication functions
 * throughout the application.
 * 
 * Uses real backend API for authentication and user data.
 */

import { createContext, useState, useEffect, ReactNode } from 'react';
import type { AuthContextType, User, Team, Task, Member, Message, Friend, TeamData, FriendRequest } from '../types';
import { api } from '../services/api';

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const userData = await api.getCurrentUser();
          setUser({
            id: Number(userData.id),
            username: userData.username,
            email: userData.email,
            avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
            description: userData.description || '',
            twoFactorEnabled: userData.twoFactorEnabled || false,
            friends: [],
            teams: [],
            globalChat: [],
          });
        }
      } catch {
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const loginTestUser = async () => {
    const result = await api.login({ 
      email: 'testuser@student.42', 
      password: 'pass12345' 
    });
    localStorage.setItem('authToken', result.token);
    setUser({
      id: Number(result.user.id),
      username: result.user.username,
      email: result.user.email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.user.username}`,
      description: '',
      twoFactorEnabled: false,
      friends: [],
      teams: [],
      globalChat: [],
    });
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    setUser({ ...user, ...updates });
  };

  const toggle2FA = () => {
    if (!user) return;
    setUser({ ...user, twoFactorEnabled: !user.twoFactorEnabled });
  };

  const leaveTeam = (teamId: number) => {
    if (!user) return;
    const updatedTeams = user.teams.filter((t) => t.id !== teamId);
    setUser({ ...user, teams: updatedTeams });
  };

  const addChatMessage = (teamId: number, message: Message) => {
    if (!user) return;
    const updatedTeams = user.teams.map((team) => {
      if (team.id === teamId) {
        return { ...team, chat: [...team.chat, message] };
      }
      return team;
    });
    setUser({ ...user, teams: updatedTeams });
  };

  const sendFriendMessage = (friendId: number, message: Message) => {
    if (!user) return;
    const updatedFriends = user.friends.map((friend) => {
      if (friend.id === friendId) {
        return { ...friend, chat: [...(friend.chat || []), message] };
      }
      return friend;
    });
    setUser({ ...user, friends: updatedFriends });
  };

  const sendGlobalMessage = (message: Message) => {
    if (!user) return;
    setUser({ ...user, globalChat: [...(user.globalChat || []), message] });
  };

  const updateTaskStatus = (teamId: number, taskId: number, status: Task['status']) => {
    if (!user) return;
    const updatedTeams = user.teams.map((team) => {
      if (team.id === teamId) {
        return {
          ...team,
          tasks: team.tasks.map((task) => {
            if (task.id === taskId) return { ...task, status };
            return task;
          }),
        };
      }
      return team;
    });
    setUser({ ...user, teams: updatedTeams });
  };

  const addTask = (teamId: number, newTask: Partial<Task>) => {
    if (!user) return;
    const updatedTeams = user.teams.map((team) => {
      if (team.id === teamId) {
        return { ...team, tasks: [...team.tasks, { id: Date.now(), ...newTask } as Task] };
      }
      return team;
    });
    setUser({ ...user, teams: updatedTeams });
  };

  const uploadFile = (teamId: number, taskId: number, file: File) => {
    if (!user) return;
    const updatedTeams = user.teams.map((team) => {
      if (team.id === teamId) {
        return {
          ...team,
          tasks: team.tasks.map((task) => {
            if (task.id === taskId) {
              return { ...task, files: [...task.files, { name: file.name, size: `${(file.size / 1024).toFixed(1)}KB` }] };
            }
            return task;
          }),
        };
      }
      return team;
    });
    setUser({ ...user, teams: updatedTeams });
  };

  const updateTaskAssignee = (teamId: number, taskId: number, member: Member) => {
    if (!user) return;
    const updatedTeams = user.teams.map((team) => {
      if (team.id === teamId) {
        return {
          ...team,
          tasks: team.tasks.map((task) => {
            if (task.id === taskId) return { ...task, assignedTo: { id: member.id, username: member.username } };
            return task;
          }),
        };
      }
      return team;
    });
    setUser({ ...user, teams: updatedTeams });
  };

  const addTeamMember = (teamId: number, member: Member, role: string) => {
    if (!user) return;
    const updatedTeams = user.teams.map((team) => {
      if (team.id === teamId) {
        const memberExists = team.members.some((m) => m.id === member.id);
        if (memberExists) return team;
        return { ...team, members: [...team.members, { ...member, role }] };
      }
      return team;
    });
    setUser({ ...user, teams: updatedTeams });
  };

  const addFriend = (friend: Friend) => {
    if (!user) return;
    const friendExists = user.friends.some((f) => f.id === friend.id);
    if (friendExists) return;
    setUser({ ...user, friends: [...user.friends, friend] });
  };

  const findUserByUsername = async (username: string) => {
    try {
      const users = await api.searchUsers(username);
      return users.find((u) => u.username.toLowerCase() === username.toLowerCase());
    } catch {
      return undefined;
    }
  };

  const removeTeamMember = (teamId: number, memberId: number) => {
    if (!user) return;
    const updatedTeams = user.teams.map((team) => {
      if (team.id === teamId) {
        return {
          ...team,
          members: team.members.filter((m) => m.id !== memberId),
          tasks: team.tasks.map((task) => {
            if (task.assignedTo?.id === memberId) return { ...task, assignedTo: null };
            return task;
          }),
        };
      }
      return team;
    });
    setUser({ ...user, teams: updatedTeams });
  };

  const createTeam = (teamData: TeamData) => {
    if (!user) return;
    const newTeam: Team = {
      id: Date.now(),
      name: teamData.name,
      objective: teamData.description,
      owner: user,
      role: 'Leader',
      status: 'active',
      members: [{ id: user.id, username: user.username, avatar: user.avatar, role: 'Leader' }],
      tasks: [],
      chat: [],
    };
    setUser({ ...user, teams: [...user.teams, newTeam] });
  };

  const updateTeamStatus = (teamId: number, status: string) => {
    if (!user) return;
    const updatedTeams = user.teams.map((team) => {
      if (team.id === teamId) return { ...team, status };
      return team;
    });
    setUser({ ...user, teams: updatedTeams });
  };

  const fetchFriendRequests = () => {
    api.getFriendRequests().then((requests) => {
      setFriendRequests(requests);
    }).catch((err) => {
      console.error('Failed to fetch friend requests:', err);
    });
  };

  const acceptFriendRequest = (requestId: number) => {
    api.acceptFriendRequest(requestId).then(() => {
      setFriendRequests(friendRequests.filter((r) => r.request_id !== requestId));
      fetchFriendRequests();
      fetchFriends();
    }).catch((err) => {
      console.error('Failed to accept friend request:', err);
    });
  };

  const rejectFriendRequest = (requestId: number) => {
    api.rejectFriendRequest(requestId).then(() => {
      setFriendRequests(friendRequests.filter((r) => r.request_id !== requestId));
      fetchFriendRequests();
      fetchSentRequests();
    }).catch((err) => {
      console.error('Failed to reject friend request:', err);
    });
  };

  const fetchSentRequests = () => {
    api.getSentFriendRequests().then((requests) => {
      setSentRequests(requests);
    }).catch((err) => {
      console.error('Failed to fetch sent requests:', err);
    });
  };

  const fetchFriends = () => {
    api.getFriends().then((friendList) => {
      setFriends(friendList);
      if (user) {
        setUser({ ...user, friends: friendList });
      }
    }).catch((err) => {
      console.error('Failed to fetch friends:', err);
    });
  };

  const removeFriend = (friendId: number) => {
    api.removeFriend(friendId).then(() => {
      setFriends(friends.filter((f) => f.id !== friendId));
      if (user) {
        setUser({ ...user, friends: user.friends.filter((f) => f.id !== friendId) });
      }
    }).catch((err) => {
      console.error('Failed to remove friend:', err);
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      loginTestUser,
      logout,
      updateUser,
      toggle2FA,
      removeFriend,
      leaveTeam,
      addChatMessage,
      sendFriendMessage,
      sendGlobalMessage,
      updateTaskStatus,
      addTask,
      uploadFile,
      updateTaskAssignee,
      addTeamMember,
      addFriend,
      findUserByUsername,
      removeTeamMember,
      createTeam,
      updateTeamStatus,
      friendRequests,
      sentRequests,
      friends,
      fetchFriendRequests,
      fetchSentRequests,
      fetchFriends,
      acceptFriendRequest,
      rejectFriendRequest,
    }}>
      {children}
    </AuthContext.Provider>
  );
};