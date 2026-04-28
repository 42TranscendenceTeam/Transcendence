/**
 * Authentication context provider
 * Manages user authentication state across the application
 */

import { createContext, useState, useEffect } from 'react';

// Create the authentication context
export const AuthContext = createContext();

// TODO: Remove after backend - Delete entire defaultTestUser, fetch user from GET /api/auth/me
// Default test user data with expanded teams
const defaultTestUser = {
  id: 1,
  username: 'TestUser',
  email: 'testuser@student.42i',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TestUser',
  description: 'Hello! I am a test user.',
  twoFactorEnabled: false,
  friends: [
    { id: 1, username: 'Felix', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
    { id: 2, username: 'Luna', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna' },
    { id: 3, username: 'Alex', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
  ],
  teams: [
    {
      id: 1,
      name: 'Project Alpha',
      objective: 'Creating a REST API for task management system with authentication and user management features',
      owner: { id: 2, username: 'Felix', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
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
      owner: { id: 1, username: 'TestUser', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TestUser' },
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
};

// AuthProvider wraps the application to provide authentication functionality
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // TODO: Send GET /api/auth/me with token, receive {user data}
  // Check for existing test user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('testUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // TODO: Remove - Replace with real API: POST /api/auth/login, set token, fetch user data
  // Handle test user login (for development/testing)
  const loginTestUser = () => {
    const testUserData = { ...defaultTestUser };
    localStorage.setItem('testUser', JSON.stringify(testUserData));
    setUser(testUserData);
  };

  // TODO: Send POST /api/auth/logout, clear token from storage
  // Handle user logout
  const logout = () => {
    localStorage.removeItem('testUser');
    setUser(null);
  };

  // TODO: Send PUT /api/users/me with {username, email, description, avatar}, receive updated user
  // - Validate email is unique, username is available on backend
  // Update user profile
  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    localStorage.setItem('testUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // TODO: Send POST /api/users/me/2fa/toggle, receive {twoFactorEnabled}
  // Toggle 2FA
  const toggle2FA = () => {
    const updatedUser = { ...user, twoFactorEnabled: !user.twoFactorEnabled };
    localStorage.setItem('testUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // TODO: Send DELETE /api/friends/{friendId}
  // Remove a friend
  const removeFriend = (friendId) => {
    const updatedFriends = user.friends.filter((f) => f.id !== friendId);
    const updatedUser = { ...user, friends: updatedFriends };
    localStorage.setItem('testUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // TODO: Send DELETE /api/teams/{teamId}/members/me
  // Leave a team
  const leaveTeam = (teamId) => {
    const updatedTeams = user.teams.filter((t) => t.id !== teamId);
    const updatedUser = { ...user, teams: updatedTeams };
    localStorage.setItem('testUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // TODO: Send POST /api/teams/{teamId}/messages with {text}, receive {message}
  // Add chat message to a team
  const addChatMessage = (teamId, message) => {
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

  // TODO: Send PUT /api/tasks/{taskId} with {status}
  // Update task status
  const updateTaskStatus = (teamId, taskId, status) => {
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

  // TODO: Send POST /api/teams/{teamId}/tasks with {title, description, status, assignedTo}, receive {task}
  // Add new task to team
  const addTask = (teamId, newTask) => {
    const updatedTeams = user.teams.map((team) => {
      if (team.id === teamId) {
        return {
          ...team,
          tasks: [...team.tasks, { id: Date.now(), ...newTask }],
        };
      }
      return team;
    });
    const updatedUser = { ...user, teams: updatedTeams };
    localStorage.setItem('testUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // TODO: Send POST /api/tasks/{taskId}/files with FormData, receive {file}
  // Upload file to task
  const uploadFile = (teamId, taskId, file) => {
    const updatedTeams = user.teams.map((team) => {
      if (team.id === teamId) {
        return {
          ...team,
          tasks: team.tasks.map((task) => {
            if (task.id === taskId) {
              return {
                ...task,
                files: [...task.files, { name: file.name, size: file.size }],
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

  // TODO: Send PUT /api/tasks/{taskId} with {assignedTo: memberId}
  // Update task assignee
  const updateTaskAssignee = (teamId, taskId, member) => {
    const updatedTeams = user.teams.map((team) => {
      if (team.id === teamId) {
        return {
          ...team,
          tasks: team.tasks.map((task) => {
            if (task.id === taskId) {
              return { ...task, assignedTo: member };
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

  // TODO: Send POST /api/teams/{teamId}/members with {userId/username, role}
  // Add member to team
  const addTeamMember = (teamId, member, role) => {
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

  // TODO: Send POST /api/friends with {userId/username}
  // Add friend
  const addFriend = (friend) => {
    const friendExists = user.friends.some((f) => f.id === friend.id);
    if (friendExists) return;
    const updatedUser = {
      ...user,
      friends: [...user.friends, friend],
    };
    localStorage.setItem('testUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

// TODO: Send GET /api/users/search?q={username}, receive [{user}]
// Find user by username
  const findUserByUsername = (username) => {
    const allUsers = [
      ...user.friends,
      { id: user.id, username: user.username, avatar: user.avatar },
    ];
    return allUsers.find((u) => u.username.toLowerCase() === username.toLowerCase());
  };

  // TODO: Send DELETE /api/teams/{teamId}/members/{memberId}
  // Remove member from team
  const removeTeamMember = (teamId, memberId) => {
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

  // TODO: Send POST /api/teams with {name, objective, lookingFor, details}, receive {team}
  // Create new team
  const createTeam = (teamData) => {
    const newTeam = {
      id: Date.now(),
      name: teamData.name,
      objective: teamData.description,
      lookingFor: teamData.lookingFor,
      details: teamData.details || [],
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

  // TODO: Send PUT /api/teams/{teamId} with {status}
  // Update team status
  const updateTeamStatus = (teamId, status) => {
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

  // Provide auth state and methods to child components
  return (
    <AuthContext.Provider value={{ user, loginTestUser, logout, updateUser, toggle2FA, removeFriend, leaveTeam, addChatMessage, updateTaskStatus, addTask, uploadFile, updateTaskAssignee, addTeamMember, addFriend, findUserByUsername, removeTeamMember, createTeam, updateTeamStatus, loading }}>
      {children}
    </AuthContext.Provider>
  );
};