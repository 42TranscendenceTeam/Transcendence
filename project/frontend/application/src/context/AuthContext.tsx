/**
 * Authentication Context Provider
 * 
 * Manages user authentication state and provides authentication functions
 * throughout the application.
 * 
 * Uses real backend API for authentication and user data.
 */

import { createContext, useState, useEffect, ReactNode } from 'react';
import type { AuthContextType, User, Team, Task, Member, Message, Friend, TeamData, FriendRequest, TeamInvite, JoinRequestNotification, AppNotification } from '../types';
import { api } from '../services/api';
import { getAvatarUrl } from '../utils/avatar';
import { validateTaskFile } from '../utils/fileValidation';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket';

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
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [teamRefreshTrigger, setTeamRefreshTrigger] = useState(0);

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
          fetchNotifications();
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

  useEffect(() => {
    const handleFocus = () => {
      const token = localStorage.getItem('authToken');
      if (token) fetchNotifications();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('authToken');
      if (token) {
        connectSocket(token);
        const sock = getSocket();
        if (sock) {
          const handler = (n: AppNotification) => {
            setNotifications((prev) => [n, ...prev]);
            if (!n.status_read) setUnreadCount((c) => c + 1);

            if (n.type === 'friend_request' || n.type === 'friend_request_accepted'
                || n.type === 'friend_request_rejected') {
              fetchFriendRequests();
              fetchSentRequests();
            }
            if (n.type === 'friend_request_accepted' || n.type === 'friend_removed') {
              fetchFriends();
            }
            if (n.type === 'team_invite' || n.type === 'team_invite_accepted'
                || n.type === 'team_invite_rejected') {
              fetchTeamInvites();
            }
            if (n.type === 'team_join_request' || n.type === 'team_join_request_accepted'
                || n.type === 'team_join_request_rejected') {
              if (user) fetchJoinRequestNotifications(user.id);
            }
            if (n.type === 'team_invite_accepted' || n.type === 'team_removed'
                || n.type === 'team_user_left' || n.type === 'team_join_request_accepted'
                || n.type === 'team_join_request') {
              setTeamRefreshTrigger((c) => c + 1);
            }
          };
          sock.on('notification:new', handler);
          return () => sock.off('notification:new', handler);
        }
      }
    } else {
      disconnectSocket();
    }
  }, [user]);

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    disconnectSocket();
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
      fetchNotifications();
    } catch (err) {
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

  const updateTaskStatus = async (teamId: number, taskId: number, status: Task['status']) => {
    if (!user) return;
    try {
      const updated = await api.updateTaskStatus(taskId, status);
      const updatedTeams = user.teams.map((team) => {
        if (team.id === teamId) {
          return {
            ...team,
            tasks: team.tasks.map((task) => {
              if (task.id === taskId) return updated;
              return task;
            }),
          };
        }
        return team;
      });
      setUser({ ...user, teams: updatedTeams });
    } catch {
    }
  };

  const addTask = async (teamId: number, newTask: Partial<Task>) => {
    if (!user) return;
    try {
      const created = await api.createTask(teamId, {
        title: newTask.title || '',
        description: newTask.description || '',
        status: newTask.status || 'open',
      });
      const updatedTeams = user.teams.map((team) => {
        if (team.id === teamId) {
          return { ...team, tasks: [...team.tasks, created] };
        }
        return team;
      });
      setUser({ ...user, teams: updatedTeams });
    } catch {
    }
  };

  const uploadFile = async (teamId: number, taskId: number, file: File) => {
    if (!user) return;
    const validation = validateTaskFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    try {
      const savedFile = await api.uploadTaskFile(taskId, file);
      const updatedTeams = user.teams.map((team) => {
        if (team.id === teamId) {
          return {
            ...team,
            tasks: team.tasks.map((task) => {
              if (task.id === taskId) {
                return { ...task, files: [...task.files, savedFile] };
              }
              return task;
            }),
          };
        }
        return team;
      });
      setUser({ ...user, teams: updatedTeams });
    } catch (err) {
      throw err;
    }
  };

  const deleteTaskFile = async (teamId: number, taskId: number, fileId: number) => {
    if (!user) return;
    try {
      await api.deleteTaskFile(fileId);
      const updatedTeams = user.teams.map((team) => {
        if (team.id === teamId) {
          return {
            ...team,
            tasks: team.tasks.map((task) => {
              if (task.id === taskId) {
                return { ...task, files: task.files.filter((f) => f.id !== fileId) };
              }
              return task;
            }),
          };
        }
        return team;
      });
      setUser({ ...user, teams: updatedTeams });
    } catch (err) {
      throw err;
    }
  };

  const updateTaskAssignee = async (teamId: number, taskId: number, members: Member[]) => {
    if (!user) return;
    try {
      const memberIds = members.map(m => m.id);
      await api.updateTaskUsers(taskId, memberIds);
      const updatedTeams = user.teams.map((team) => {
        if (team.id === teamId) {
          return {
            ...team,
            tasks: team.tasks.map((task) => {
              if (task.id === taskId) return { ...task, assignedTo: members.map(m => ({ id: m.id, username: m.username })) };
              return task;
            }),
          };
        }
        return team;
      });
      setUser({ ...user, teams: updatedTeams });
    } catch {
    }
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
              if (task.assignedTo?.some(a => a.id === memberId)) return { ...task, assignedTo: task.assignedTo.filter(a => a.id !== memberId) };
              return task;
            }),
          };
        }
        return team;
      });
      setUser({ ...user, teams: updatedTeams });
    } catch (err) {
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
    }).catch(() => {});
  };

  const acceptFriendRequest = (requestId: number) => {
    api.acceptFriendRequest(requestId).then(() => {
      setFriendRequests(friendRequests.filter((r) => r.request_id !== requestId));
      fetchFriendRequests();
      fetchFriends();
      fetchNotifications();
    }).catch(() => {});
  };

  const rejectFriendRequest = (requestId: number) => {
    api.rejectFriendRequest(requestId).then(() => {
      setFriendRequests(friendRequests.filter((r) => r.request_id !== requestId));
      fetchFriendRequests();
      fetchSentRequests();
      fetchNotifications();
    }).catch(() => {});
  };

  const fetchSentRequests = () => {
    api.getSentFriendRequests().then((requests) => {
      setSentRequests(requests);
    }).catch(() => {});
  };

  const fetchFriends = () => {
    api.getFriends().then((friendList) => {
      setFriends(friendList);
      if (user) {
        setUser({ ...user, friends: friendList });
      }
    }).catch(() => {});
  };

  const removeFriend = (friendId: number) => {
    api.removeFriend(friendId).then(() => {
      setFriends(friends.filter((f) => f.id !== friendId));
      if (user) {
        setUser({ ...user, friends: user.friends.filter((f) => f.id !== friendId) });
      }
    }).catch(() => {});
  };

  const fetchNotifications = () => {
    api.getNotifications().then((list) => {
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.status_read).length);
    }).catch(() => {});
  };

  const markAsRead = (id: number) => {
    const notif = notifications.find(n => n.id === id);
    if (notif?.status_read) return;

    api.readNotification(id).then(() => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }).catch(() => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status_read: true } : n))
      );
    });
  };

  const markAllAsRead = () => {
    api.readAllNotifications().then(() => {
      setNotifications((prev) => prev.map((n) => ({ ...n, status_read: true })));
      setUnreadCount(0);
    }).catch(() => {});
  };

  const deleteNotification = (id: number) => {
    api.deleteNotification(id).then(() => {
      setNotifications((prev) => {
        const removed = prev.find((n) => n.id === id);
        if (removed && !removed.status_read) {
          setUnreadCount((c) => Math.max(0, c - 1));
        }
        return prev.filter((n) => n.id !== id);
      });
    }).catch(() => {});
  };

  const deleteAllNotifications = () => {
    api.deleteAllNotifications().then(() => {
      setNotifications([]);
      setUnreadCount(0);
    }).catch(() => {});
  };

  const fetchTeamInvites = () => {
    api.getTeamInvites().then((invites) => {
      setTeamInvites(invites);
      setUnreadNotifications(invites.length + joinRequestNotifications.length);
    }).catch(() => {});
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
    } catch {
    }
  };

  const acceptTeamInvite = (inviteId: number) => {
    api.acceptTeamInvite(inviteId).then(() => {
      setTeamInvites(teamInvites.filter((i) => i.invite_id !== inviteId));
      setUnreadNotifications((prev) => Math.max(0, prev - 1));
      fetchNotifications();
      setTimeout(() => window.location.reload(), 300);
    }).catch(() => {});
  };

  const rejectTeamInvite = (inviteId: number) => {
    api.rejectTeamInvite(inviteId).then(() => {
      setTeamInvites(teamInvites.filter((i) => i.invite_id !== inviteId));
      setUnreadNotifications((prev) => Math.max(0, prev - 1));
      fetchNotifications();
    }).catch(() => {});
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
      deleteTaskFile,
      updateTaskAssignee,
      addTeamMember,
      addFriend,
      findUserByUsername,
      removeTeamMember,
      createTeam,
      updateTeamStatus,
      updateTeamSettings,
      notifications,
      unreadCount,
      friendRequests,
      sentRequests,
      friends,
      teamInvites,
      joinRequestNotifications,
      unreadNotifications,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      deleteAllNotifications,
      fetchFriendRequests,
      fetchSentRequests,
      fetchFriends,
      fetchTeamInvites,
      teamRefreshTrigger,
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