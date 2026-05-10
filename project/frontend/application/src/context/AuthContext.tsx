/**
 * Authentication Context Provider
 * 
 * Manages user authentication state and provides authentication functions
 * throughout the application.
 * 
 * Features:
 * - Mock mode: Uses localStorage for demo purposes
 * - Real mode: Integrates with backend API
 * 
 * TODO: Remove mock data after full backend implementation
 */

import { createContext, useState, useEffect, ReactNode } from 'react';
import type { AuthContextType, User, Team, Task, Member, Message, Friend, TeamData } from '../types';
import { api } from '../services/api';

// TODO: Mock data, delete after full backend implementations
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const AuthContext = createContext<AuthContextType | null>(null);

const defaultTestUser: User = {
  id: 1,
  username: 'TestUser',
  email: 'testuser@student.42i',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TestUser',
  description: 'Hello! I am a test user.',
  twoFactorEnabled: false,
  friends: [
    { id: 1, username: 'Felix', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', chat: [] },
    { id: 2, username: 'Luna', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna', chat: [] },
    { id: 3, username: 'Alex', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', chat: [] },
  ],
  teams: [
    {
      id: 1,
      name: 'Project Alpha',
      objective: 'Creating a REST API for task management system with authentication and user management features',
      owner: { id: 2, username: 'Felix', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', description: '', twoFactorEnabled: false, friends: [], teams: [] },
      role: 'Member',
      status: 'active',
      members: [
        { id: 2, username: 'Felix', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', role: 'Leader' },
        { id: 1, username: 'TestUser', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TestUser', role: 'Member' },
        { id: 3, username: 'Luna', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna', role: 'Member' },
      ],
      tasks: [
        { 
          id: 1, 
          title: 'Design API Schema', 
          description: 'Create the database schema for users and tasks',
          status: 'done',
          assignedTo: { id: 2, username: 'Felix' },
          files: [{ name: 'schema.sql', size: '2.5KB' }]
        },
        { 
          id: 2, 
          title: 'Implement Authentication', 
          description: 'Add JWT-based authentication with refresh tokens',
          status: 'in_progress',
          assignedTo: { id: 1, username: 'TestUser' },
          files: []
        },
        { 
          id: 3, 
          title: 'API Documentation', 
          description: 'Write documentation for all API endpoints',
          status: 'to_do',
          assignedTo: { id: 3, username: 'Luna' },
          files: [{ name: 'api-docs.md', size: '1.2KB' }, { name: 'endpoints.json', size: '0.8KB' }]
        },
      ],
      chat: [],
    },
    {
      id: 2,
      name: 'Hackathon Team',
      objective: 'Building a prototype for the upcoming school hackathon event',
      owner: { id: 1, username: 'TestUser', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TestUser', description: '', twoFactorEnabled: false, friends: [], teams: [] },
      role: 'Leader',
      status: 'active',
      members: [
        { id: 1, username: 'TestUser', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TestUser', role: 'Leader' },
        { id: 4, username: 'Max', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Max', role: 'Member' },
      ],
      tasks: [
        { 
          id: 1, 
          title: 'Brainstorm Ideas', 
          description: 'Come up with innovative project ideas',
          status: 'done',
          assignedTo: { id: 1, username: 'TestUser' },
          files: []
        },
        { 
          id: 2, 
          title: 'Create Pitch Deck', 
          description: 'Prepare a presentation for the hackathon',
          status: 'to_do',
          assignedTo: { id: 4, username: 'Max' },
          files: [{ name: 'pitch.pptx', size: '5.2MB' }]
        },
      ],
      chat: [],
    },
  ],
  globalChat: [],
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Mock data, delete after full backend implementations
    if (USE_MOCK) {
      const savedUser = localStorage.getItem('testUser');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        if (!parsedUser.globalChat) {
          parsedUser.globalChat = [];
        }
        setUser(parsedUser);
      }
    } else {
      const token = localStorage.getItem('authToken');
      if (token) {
        // TODO: Fetch user data from backend using token
      }
    }
    setLoading(false);
  }, []);

  const loginTestUser = async () => {
    // TODO: Mock data, delete after full backend implementations
    if (USE_MOCK) {
      const testUserData = { ...defaultTestUser };
      localStorage.setItem('testUser', JSON.stringify(testUserData));
      setUser(testUserData);
    } else {
      // TODO: Implement actual login via API
      // const result = await api.login({ email, password });
      // localStorage.setItem('authToken', result.token);
    }
  };

  const logout = () => {
    // TODO: Mock data, delete after full backend implementations
    if (USE_MOCK) {
      localStorage.removeItem('testUser');
    } else {
      localStorage.removeItem('authToken');
    }
    setUser(null);
  };

  // TODO: Mock data, delete after full backend implementations
  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    localStorage.setItem('testUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // TODO: Mock data, delete after full backend implementations
  const toggle2FA = () => {
    if (!user) return;
    const updatedUser = { ...user, twoFactorEnabled: !user.twoFactorEnabled };
    localStorage.setItem('testUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // TODO: Mock data, delete after full backend implementations
  const removeFriend = (friendId: number) => {
    if (!user) return;
    const updatedFriends = user.friends.filter((f) => f.id !== friendId);
    const updatedUser = { ...user, friends: updatedFriends };
    localStorage.setItem('testUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // TODO: Mock data, delete after full backend implementations
  const leaveTeam = (teamId: number) => {
    if (!user) return;
    const updatedTeams = user.teams.filter((t) => t.id !== teamId);
    const updatedUser = { ...user, teams: updatedTeams };
    localStorage.setItem('testUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // TODO: Mock data, delete after full backend implementations
  const addChatMessage = (teamId: number, message: Message) => {
    if (!user) return;
    const updatedTeams = user.teams.map((team) => {
      if (team.id === teamId) {
        return {
          ...team,
          chat: [...team.chat, message],
        };
      }
      return team;
    });
    const updatedUser = { ...user, teams: updatedTeams };
    localStorage.setItem('testUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // TODO: Mock data, delete after full backend implementations
  const sendFriendMessage = (friendId: number, message: Message) => {
    if (!user) return;
    const updatedFriends = user.friends.map((friend) => {
      if (friend.id === friendId) {
        return {
          ...friend,
          chat: [...(friend.chat || []), message],
        };
      }
      return friend;
    });
    const updatedUser = { ...user, friends: updatedFriends };
    localStorage.setItem('testUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const sendGlobalMessage = (message: Message) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      globalChat: [...(user.globalChat || []), message],
    };
    localStorage.setItem('testUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // TODO: Mock data, delete after full backend implementations
  const updateTaskStatus = (teamId: number, taskId: number, status: Task['status']) => {
    if (!user) return;
    const updatedTeams = user.teams.map((team) => {
      if (team.id === teamId) {
        return {
          ...team,
          tasks: team.tasks.map((task) => {
            if (task.id === taskId) {
              return { ...task, status };
            }
            return task;
          }),
        };
      }
      return team;
    });
    const updatedUser = { ...user, teams: updatedTeams };
    localStorage.setItem('testUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // TODO: Mock data, delete after full backend implementations
  const addTask = (teamId: number, newTask: Partial<Task>) => {
    if (!user) return;
    const updatedTeams = user.teams.map((team) => {
      if (team.id === teamId) {
        return {
          ...team,
          tasks: [...team.tasks, { id: Date.now(), ...newTask } as Task],
        };
      }
      return team;
    });
    const updatedUser = { ...user, teams: updatedTeams };
    localStorage.setItem('testUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // TODO: Mock data, delete after full backend implementations
  const uploadFile = (teamId: number, taskId: number, file: File) => {
    if (!user) return;
    const updatedTeams = user.teams.map((team) => {
      if (team.id === teamId) {
        return {
          ...team,
          tasks: team.tasks.map((task) => {
            if (task.id === taskId) {
              return {
                ...task,
                files: [...task.files, { name: file.name, size: `${(file.size / 1024).toFixed(1)}KB` }],
              };
            }
            return task;
          }),
        };
      }
      return team;
    });
    const updatedUser = { ...user, teams: updatedTeams };
    localStorage.setItem('testUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // TODO: Mock data, delete after full backend implementations
  const updateTaskAssignee = (teamId: number, taskId: number, member: Member) => {
    if (!user) return;
    const updatedTeams = user.teams.map((team) => {
      if (team.id === teamId) {
        return {
          ...team,
          tasks: team.tasks.map((task) => {
            if (task.id === taskId) {
              return { ...task, assignedTo: { id: member.id, username: member.username } };
            }
            return task;
          }),
        };
      }
      return team;
    });
    const updatedUser = { ...user, teams: updatedTeams };
    localStorage.setItem('testUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // TODO: Mock data, delete after full backend implementations
  const addTeamMember = (teamId: number, member: Member, role: string) => {
    if (!user) return;
    const updatedTeams = user.teams.map((team) => {
      if (team.id === teamId) {
        const memberExists = team.members.some((m) => m.id === member.id);
        if (memberExists) return team;
        return {
          ...team,
          members: [...team.members, { ...member, role }],
        };
      }
      return team;
    });
    const updatedUser = { ...user, teams: updatedTeams };
    localStorage.setItem('testUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // TODO: Mock data, delete after full backend implementations
  const addFriend = (friend: Friend) => {
    if (!user) return;
    const friendExists = user.friends.some((f) => f.id === friend.id);
    if (friendExists) return;
    const updatedUser = {
      ...user,
      friends: [...user.friends, friend],
    };
    localStorage.setItem('testUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // TODO: Mock data, delete after full backend implementations
  const findUserByUsername = (username: string): User | undefined => {
    if (!user) return undefined;
    const allUsers = [
      ...user.friends,
      { id: user.id, username: user.username, avatar: user.avatar, email: '', description: '', twoFactorEnabled: false, friends: [], teams: [] },
    ];
    return allUsers.find((u) => u.username.toLowerCase() === username.toLowerCase());
  };

  // TODO: Mock data, delete after full backend implementations
  const removeTeamMember = (teamId: number, memberId: number) => {
    if (!user) return;
    const updatedTeams = user.teams.map((team) => {
      if (team.id === teamId) {
        return {
          ...team,
          members: team.members.filter((m) => m.id !== memberId),
          tasks: team.tasks.map((task) => {
            if (task.assignedTo?.id === memberId) {
              return { ...task, assignedTo: null };
            }
            return task;
          }),
        };
      }
      return team;
    });
    const updatedUser = { ...user, teams: updatedTeams };
    localStorage.setItem('testUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // TODO: Mock data, delete after full backend implementations
  const createTeam = (teamData: TeamData) => {
    if (!user) return;
    const newTeam: Team = {
      id: Date.now(),
      name: teamData.name,
      objective: teamData.description,
      owner: user,
      role: 'Leader',
      status: 'active',
      members: [
        { id: user.id, username: user.username, avatar: user.avatar, role: 'Leader' },
      ],
      tasks: [],
      chat: [],
    };
    const updatedUser = {
      ...user,
      teams: [...user.teams, newTeam],
    };
    localStorage.setItem('testUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // TODO: Mock data, delete after full backend implementations
  const updateTeamStatus = (teamId: number, status: string) => {
    if (!user) return;
    const updatedTeams = user.teams.map((team) => {
      if (team.id === teamId) {
        return { ...team, status };
      }
      return team;
    });
    const updatedUser = { ...user, teams: updatedTeams };
    localStorage.setItem('testUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
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
    }}>
      {children}
    </AuthContext.Provider>
  );
};