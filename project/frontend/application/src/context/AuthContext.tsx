/**
 * Authentication Context Provider
 * 
 * Manages user authentication state and provides authentication functions
 * throughout the application.
 * 
 * Uses real backend API for authentication and user data.
 */

import { createContext, useState, useEffect, ReactNode } from 'react';
import type { AuthContextType, User, Team, Task, Member, Message, Friend, TeamData, FriendRequest, TeamInvite, JoinRequestNotification } from '../types';
import { api } from '../services/api';
import { getAvatarUrl } from '../utils/avatar';

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
  const [teamInvites, setTeamInvites] = useState<TeamInvite[]>([]);
  const [joinRequestNotifications, setJoinRequestNotifications] = useState<JoinRequestNotification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const userData = await api.getCurrentUser();
          const userId = Number(userData.id);
          const userAvatar = getAvatarUrl(userData.avatar);
          setUser({
            id: userId,
            username: userData.username,
            email: userData.email,
            avatar: userAvatar,
            description: userData.description || '',
            twoFactorEnabled: userData.twoFactorEnabled || false,
            friends: [],
            teams: [],
            globalChat: [],
          });
          fetchTeamInvites();
          api.getTeams().then((teams) => {
            const myTeams = teams.filter((t) => t.owner?.id === userId);
            setUser((prev) => prev ? { ...prev, teams: myTeams } : prev);
            fetchJoinRequestNotifications(userId);
          }).catch(() => {});
        }
      } catch {
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

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

  const leaveTeam = async (teamId: number) => {
    if (!user) return;
    try {
      await api.leaveTeam(teamId);
      const updatedTeams = user.teams.filter((t) => t.id !== teamId);
      setUser({ ...user, teams: updatedTeams });
    } catch (err) {
      console.error('Failed to leave team:', err);
      throw err;
    }
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

  const removeTeamMember = async (teamId: number, memberId: number) => {
    if (!user) return;
    try {
      await api.removeTeamMember(teamId, memberId);
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
    } catch (err) {
      console.error('Failed to remove team member:', err);
      throw err;
    }
  };

  const createTeam = async (teamData: TeamData) => {
    if (!user) return;
    try {
      const createdTeam = await api.createTeam({
        name: teamData.name,
        objective: teamData.description,
        maxUsers: (teamData.lookingFor || 1) + 1,
        tags: teamData.details || [],
      });
      const team = {
        id: createdTeam.id,
        name: createdTeam.name,
        objective: createdTeam.about || '',
        owner: {
          id: user.id,
          username: user.username,
          avatar: user.avatar,
        },
        role: 'Leader',
        status: createdTeam.status_ongoing ? 'active' : 'finished',
        members: [],
        tasks: [],
        chat: [],
      };
      setUser({
        ...user,
        teams: [...user.teams, team],
      });
    } catch (err) {
      console.error('Failed to create team:', err);
      throw err;
    }
  };

  const updateTeamStatus = async (teamId: number, status: string) => {
    if (!user) return;
    try {
      await api.updateTeam(teamId, { status });
      const updatedTeams = user.teams.map((team) => {
        if (team.id === teamId) return { ...team, status };
        return team;
      });
      setUser({ ...user, teams: updatedTeams });
    } catch (err) {
      console.error('Failed to update team status:', err);
      throw err;
    }
  };

  const updateTeamSettings = async (teamId: number, data: { name?: string; objective?: string; tags?: string[] }) => {
    if (!user) return;
    const updated = await api.updateTeam(teamId, { name: data.name, objective: data.objective, tags: data.tags });
    const updatedTeams = user.teams.map((team) => {
      if (team.id === teamId) {
        return {
          ...team,
          name: data.name ?? team.name,
          objective: data.objective ?? team.objective,
          tags: data.tags ?? team.tags,
        };
      }
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

  const fetchTeamInvites = () => {
    api.getTeamInvites().then((invites) => {
      setTeamInvites(invites);
      setUnreadNotifications(invites.length + joinRequestNotifications.length);
    }).catch((err) => {
      console.error('Failed to fetch team invites:', err);
    });
  };

  const fetchJoinRequestNotifications = async (userId?: number) => {
    try {
      const currentUserId = userId ?? user?.id;
      if (!currentUserId) return;
      const teams = await api.getTeams();
      const ownedTeams = teams.filter((t) => t.owner?.id === currentUserId);
      const results = await Promise.all(
        ownedTeams.map((team) =>
          api.getJoinRequests(team.id).then((data) => ({
            team_id: team.id,
            team_name: team.name,
            requests: data.request_list || [],
          }))
        )
      );
      const allRequests = results.flatMap(({ team_id, team_name, requests }) =>
        requests.map((req) => ({
          request_id: req.request_id,
          user_id: req.user_id,
          username: req.username,
          avatar_url: req.avatar_url,
          requested_at: req.requested_at,
          team_id,
          team_name,
        }))
      );
      setJoinRequestNotifications(allRequests);
      setUnreadNotifications(teamInvites.length + allRequests.length);
    } catch (err) {
      console.error('Failed to fetch join request notifications:', err);
    }
  };

  const acceptTeamInvite = (inviteId: number) => {
    api.acceptTeamInvite(inviteId).then(() => {
      setTeamInvites(teamInvites.filter((i) => i.invite_id !== inviteId));
      setUnreadNotifications((prev) => Math.max(0, prev - 1));
    }).catch((err) => {
      console.error('Failed to accept team invite:', err);
    });
  };

  const rejectTeamInvite = (inviteId: number) => {
    api.rejectTeamInvite(inviteId).then(() => {
      setTeamInvites(teamInvites.filter((i) => i.invite_id !== inviteId));
      setUnreadNotifications((prev) => Math.max(0, prev - 1));
    }).catch((err) => {
      console.error('Failed to reject team invite:', err);
    });
  };

  const markNotificationsRead = () => {
    setUnreadNotifications(0);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
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
      updateTeamSettings,
      friendRequests,
      sentRequests,
      friends,
      teamInvites,
      joinRequestNotifications,
      unreadNotifications,
      fetchFriendRequests,
      fetchSentRequests,
      fetchFriends,
      fetchTeamInvites,
      fetchJoinRequestNotifications,
      acceptFriendRequest,
      rejectFriendRequest,
      acceptTeamInvite,
      rejectTeamInvite,
      markNotificationsRead,
    }}>
      {children}
    </AuthContext.Provider>
  );
};