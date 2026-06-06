/**
 * Team Detail Page Component
 * 
 * Displays single team details including:
 * - Team info and members
 * - Tasks list
 * - Team chat
 * - Task creation/editing
 * 
 * Uses real API for user search when adding members.
 */

import { useContext, useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { api } from '../../services/api';
import { getAvatarUrl } from '../../utils/avatar';
import { ALLOWED_TASK_EXTENSIONS } from '../../utils/fileValidation';
import type { Task, Member, TaskFile } from '../../types';

interface SearchUser {
  id: number;
  username: string;
}

function TeamDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, leaveTeam, addChatMessage, updateTaskStatus, addTask, uploadFile, deleteTaskFile, updateTaskAssignee, addTeamMember, findUserByUsername, removeTeamMember, updateTeamStatus, updateTeamSettings, fetchNotifications, teamRefreshTrigger, onlineFriendIds } = useContext(AuthContext);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', assignedTo: [] as string[], status: 'open' as Task['status'] });
  const [statusFilter, setStatusFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState('');
  const [manualUsername, setManualUsername] = useState('');
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [showFinishedError, setShowFinishedError] = useState(false);
  const [allUsers, setAllUsers] = useState<SearchUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [errorUsers, setErrorUsers] = useState('');
  const [showTeamFullModal, setShowTeamFullModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successReload, setSuccessReload] = useState(false);
  const [showEditTeamModal, setShowEditTeamModal] = useState(false);
  const [editTeamName, setEditTeamName] = useState('');
  const [editTeamObjective, setEditTeamObjective] = useState('');
  const [editTeamTags, setEditTeamTags] = useState<string[]>([]);
  const fileInputRefs = useRef<Record<number, HTMLInputElement>>({});
  const [team, setTeam] = useState<any>(null);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [teamError, setTeamError] = useState('');
  const [tasks, setTasks] = useState<any[]>([]);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [showFileError, setShowFileError] = useState(false);
  const [fileErrorMessage, setFileErrorMessage] = useState('');
  const [showDeleteTaskConfirm, setShowDeleteTaskConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [showDeleteFileConfirm, setShowDeleteFileConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{ taskId: number; fileId: number } | null>(null);
  const [showFormAssigneeDropdown, setShowFormAssigneeDropdown] = useState(false);
  const [openAssigneeTask, setOpenAssigneeTask] = useState<number | null>(null);
  const [downloadingFileId, setDownloadingFileId] = useState<number | null>(null);
  const formAssigneeRef = useRef<HTMLDivElement>(null);
  const [memberOnlineStatus, setMemberOnlineStatus] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchTeam = async () => {
      if (!id) return;
      try {
        setLoadingTeam(true);
        const teamData = await api.getTeam(parseInt(id));
        setTeam(teamData);
      } catch (err) {
        console.error('Failed to fetch team:', err);
        setTeamError('Failed to load team');
      } finally {
        setLoadingTeam(false);
      }
    };
    fetchTeam();
  }, [id, teamRefreshTrigger]);

  useEffect(() => {
    if (!team?.members) return;
    const nonFriendMembers = team.members.filter((m: Member) => m.id !== user?.id && !onlineFriendIds.has(m.id));
    if (nonFriendMembers.length === 0) return;
    nonFriendMembers.forEach((m: Member) => {
      api.getUserOnline(m.id).then(d => {
        setMemberOnlineStatus(prev => ({ ...prev, [m.id]: d.Online }));
      }).catch(() => {});
    });
  }, [team?.members, user?.id]);

  useEffect(() => {
    if (!team?.members) return;
    const poll = setInterval(() => {
      const toCheck = team.members.filter((m: Member) => m.id !== user?.id && !onlineFriendIds.has(m.id));
      if (toCheck.length === 0) return;
      toCheck.forEach((m: Member) => {
        api.getUserOnline(m.id).then(d => {
          setMemberOnlineStatus(prev => ({ ...prev, [m.id]: d.Online }));
        }).catch(() => {});
      });
    }, 5000);
    return () => clearInterval(poll);
  }, [team?.members, user?.id]);

  useEffect(() => {
    const fetchJoinRequests = async () => {
      if (!id || team?.role !== 'Leader') return;
      try {
        const data = await api.getJoinRequests(parseInt(id));
        setJoinRequests(data.request_list || []);
      } catch (err) {
        console.error('Failed to fetch join requests:', err);
      }
    };
    fetchJoinRequests();
  }, [id, team?.role, teamRefreshTrigger]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!id) return;
      try {
        const taskData = await api.getTasks(parseInt(id));
        const tasksWithFiles = await Promise.all(
          taskData.map(async (task) => {
            try {
              const files = await api.getTaskFiles(task.id);
              return { ...task, files };
            } catch {
              return task;
            }
          })
        );
        setTasks(tasksWithFiles);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
      }
    };
    fetchTasks();
  }, [id, teamRefreshTrigger]);

  useEffect(() => {
    if (showAddMemberModal && allUsers.length === 0) {
      fetchUsers();
    }
  }, [showAddMemberModal]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (showFormAssigneeDropdown && formAssigneeRef.current && !formAssigneeRef.current.contains(target)) {
        setShowFormAssigneeDropdown(false);
      }
      if (openAssigneeTask !== null) {
        const panel = document.getElementById(`assignee-panel-${openAssigneeTask}`);
        const trigger = document.getElementById(`assignee-trigger-${openAssigneeTask}`);
        if (panel && !panel.contains(target) && trigger && !trigger.contains(target)) {
          setOpenAssigneeTask(null);
        }
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowFormAssigneeDropdown(false);
        setOpenAssigneeTask(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [showFormAssigneeDropdown, openAssigneeTask]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setErrorUsers('');
    try {
      const users = await api.searchUsers('');
      setAllUsers(users);
    } catch (err) {
      setErrorUsers('Failed to load users');
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const isLeader = team?.role === 'Leader';
  const isActive = team?.status === 'active';
  const canEdit = team && isActive;
  const canChangeStatus = isLeader;

  const taskCounts = {
    total: tasks.length || 0,
    open: tasks.filter((t) => t.status === 'open').length || 0,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length || 0,
    closed: tasks.filter((t) => t.status === 'closed').length || 0,
  };

  if (loadingTeam) {
    return (
      <div className="team-detail-page">
        <div className="loading">{t('common.loading')}</div>
      </div>
    );
  }

  if (teamError || !team) {
    return (
      <div className="team-detail-page">
        <h1>{t('teams.notFound') || 'Team not found'}</h1>
        <p>{t('teams.notFoundDesc') || 'This team does not exist or you are not a member.'}</p>
      </div>
    );
  }

  const availableUsers = allUsers
    .filter((u) => u.id !== user.id)
    .filter((u) => !team.members.some((m) => m.id === u.id))
    .map((u) => ({
      id: u.id,
      username: u.username,
      avatar: getAvatarUrl(u.avatar_url),
    }));

  const filteredTasks = (tasks || []).filter((task: any) => {
    const statusMatch = statusFilter === 'all' || task.status === statusFilter;
    const assigneeMatch = assigneeFilter === 'all' || (task.assignedTo && task.assignedTo.some(a => a.username === assigneeFilter));
    return statusMatch && assigneeMatch;
  });

  const handleLeaveTeam = () => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.assignedTo?.some(a => a.id === user.id)
          ? { ...task, assignedTo: task.assignedTo.filter(a => a.id !== user.id) }
          : task
      )
    );
    leaveTeam(team.id);
    navigate('/profile/teams');
  };

  const handleDeleteTeam = async () => {
    try {
      await api.deleteTeam(team.id);
      navigate('/profile/teams');
    } catch (err) {
      console.error('Failed to delete team:', err);
      alert('Failed to delete team');
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !canEdit) return;
    const message = {
      id: Date.now(),
      text: chatMessage,
      sender: { id: user.id, username: user.username, avatar: user.avatar },
      timestamp: new Date().toISOString(),
    };
    addChatMessage(team.id, message);
    setChatMessage('');
  };

  const handleStatusChangeClick = (status: string) => {
    if (status === '__delete__') {
      setShowDeleteConfirm(true);
      return;
    }
    if (team.status === 'finished' && status === 'active') {
      setShowFinishedError(true);
      return;
    }
    setNewStatus(status);
    setShowStatusModal(true);
  };

  const handleConfirmStatusChange = async () => {
    await updateTeamStatus(team.id, newStatus);
    setTeam({ ...team, status: newStatus });
    setShowStatusModal(false);
    setNewStatus('');
  };

  const handleSaveTeamSettings = async () => {
    try {
      await updateTeamSettings(team.id, {
        name: editTeamName,
        objective: editTeamObjective,
        tags: editTeamTags,
      });
      setTeam({
        ...team,
        name: editTeamName,
        objective: editTeamObjective,
        tags: editTeamTags,
      });
      setShowEditTeamModal(false);
      setSuccessMessage(t('teams.settingsUpdated'));
      setSuccessReload(false);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Failed to update team settings:', err);
      alert('Failed to update team settings');
    }
  };

  const toggleEditTag = (tag: string) => {
    setEditTeamTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleAcceptJoinRequest = async (requestId: number) => {
    if (team.members.length >= team.maxUsers) {
      setShowTeamFullModal(true);
      return;
    }
    try {
      await api.acceptJoinRequest(team.id, requestId);
      setJoinRequests(prev => prev.filter(r => r.request_id !== requestId));
      const updatedTeam = await api.getTeam(parseInt(id));
      setTeam(updatedTeam);
      setSuccessMessage(t('teams.joinRequestAccepted'));
      setSuccessReload(false);
      setShowSuccessModal(true);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to accept join request:', err);
      alert(t('teams.failedToAcceptRequest'));
    }
  };

  const handleRejectJoinRequest = async (requestId: number) => {
    try {
      await api.rejectJoinRequest(team.id, requestId);
      setJoinRequests(prev => prev.filter(r => r.request_id !== requestId));
      setSuccessMessage(t('teams.joinRequestRejected'));
      setSuccessReload(false);
      setShowSuccessModal(true);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to reject join request:', err);
      alert(t('teams.failedToRejectRequest'));
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim() || !canEdit) return;
    try {
      const members = team.members.filter((m: Member) => newTask.assignedTo.includes(m.username));
      const createdTask = await api.createTask(team.id, {
        title: newTask.title,
        description: newTask.description,
        status: newTask.status,
        user_ids: members.map((m: Member) => m.id),
      });
      setTasks([...tasks, createdTask]);
      setNewTask({ title: '', description: '', assignedTo: [], status: 'open' });
      setShowTaskForm(false);
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleTaskStatusChange = async (taskId: number, newStatus: Task['status']) => {
    if (!canEdit) return;
    try {
      const updatedTask = await api.updateTaskStatus(taskId, newStatus);
      setTasks(tasks.map((t) => t.id === taskId ? updatedTask : t));
      updateTaskStatus(team.id, taskId, newStatus);
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const handleAssigneeChange = async (taskId: number, selectedMembers: Member[]) => {
    if (!canEdit) return;
    try {
      const memberIds = selectedMembers.map(m => m.id);
      await api.updateTaskUsers(taskId, memberIds);
      setTasks(tasks.map((t) => t.id === taskId ? { ...t, assignedTo: selectedMembers.map(m => ({ id: m.id, username: m.username })) } : t));
      updateTaskAssignee(team.id, taskId, selectedMembers);
    } catch (err) {
      console.error('Failed to update task users:', err);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      const files = await api.getTaskFiles(taskId);
      await Promise.all(files.map((f) => api.deleteTaskFile(f.id)));
      await api.deleteTask(taskId);
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleConfirmDeleteTask = async () => {
    if (taskToDelete === null) return;
    await handleDeleteTask(taskToDelete);
    setShowDeleteTaskConfirm(false);
    setTaskToDelete(null);
  };

  const handleConfirmDeleteFile = async () => {
    if (!fileToDelete) return;
    await handleDeleteFile(fileToDelete.taskId, fileToDelete.fileId);
    setShowDeleteFileConfirm(false);
    setFileToDelete(null);
  };

  const handleFileUpload = async (taskId: number) => {
    if (!canEdit) return;
    const input = fileInputRefs.current[taskId];
    if (input && input.files && input.files.length > 0) {
      const file = input.files[0];
      try {
        await uploadFile(team.id, taskId, file);
        const files = await api.getTaskFiles(taskId);
        setTasks(tasks.map((t) => t.id === taskId ? { ...t, files } : t));
        setSuccessMessage(t('teams.fileUploadSuccess', { defaultValue: 'File uploaded successfully' }));
        setSuccessReload(false);
        setShowSuccessModal(true);
      } catch (err: any) {
        setFileErrorMessage(err.message || 'Failed to upload file');
        setShowFileError(true);
      }
      input.value = '';
    }
  };

  const handleDeleteFile = async (taskId: number, fileId: number) => {
    if (!canEdit) return;
    try {
      await deleteTaskFile(team.id, taskId, fileId);
      setTasks(tasks.map((t) =>
        t.id === taskId ? { ...t, files: t.files.filter((f: TaskFile) => f.id !== fileId) } : t
      ));
    } catch (err: any) {
      setFileErrorMessage(err.message || 'Failed to delete file');
      setShowFileError(true);
    }
  };

  const handleAddMemberFromDropdown = async () => {
    if (!selectedFriend || !canEdit || !user) return;
    if (team.members.length >= team.maxUsers) {
      setShowTeamFullModal(true);
      return;
    }
    const userToAdd = availableUsers.find((u) => u.username === selectedFriend);
    if (userToAdd) {
      try {
        await api.sendTeamInvite(team.id, userToAdd.id);
      } catch {
        setErrorUsers('Failed to send invite');
        return;
      }
      addTeamMember(team.id, { id: userToAdd.id, username: userToAdd.username, avatar: userToAdd.avatar, role: 'Member' }, 'Member');
      setSelectedFriend('');
      setShowAddMemberModal(false);
      setSuccessMessage(t('teams.inviteSentSuccess'));
      setSuccessReload(false);
      setShowSuccessModal(true);
    }
  };

  const handleAddMemberManual = async () => {
    if (!manualUsername.trim() || !canEdit) return;
    if (team.members.length >= team.maxUsers) {
      setShowTeamFullModal(true);
      return;
    }
    setLoadingUsers(true);
    setErrorUsers('');
    try {
      const users = await api.searchUsers(manualUsername.trim());
      const foundUser = users.find(
        (u) => u.username.toLowerCase() === manualUsername.trim().toLowerCase()
      );
      if (foundUser && !team.members.some((m) => m.id === foundUser.id)) {
        try {
          await api.sendTeamInvite(team.id, foundUser.id);
        } catch {
          setErrorUsers('Failed to send invite');
          return;
        }
        addTeamMember(team.id, {
          id: foundUser.id,
          username: foundUser.username,
          avatar: getAvatarUrl(u.avatar_url),
          role: 'Member',
        }, 'Member');
        setManualUsername('');
        setShowAddMemberModal(false);
        setSuccessMessage(t('teams.inviteSentSuccess'));
        setSuccessReload(false);
        setShowSuccessModal(true);
      } else {
        setErrorUsers('User not found or already a member');
      }
    } catch (err) {
      setErrorUsers('Failed to find user');
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleRemoveMember = (member: Member) => {
    if (!isLeader) return;
    setMemberToRemove(member);
    setShowRemoveMemberModal(true);
  };

  const handleConfirmRemove = async () => {
    if (!isLeader || !memberToRemove) return;
    try {
      await removeTeamMember(team.id, memberToRemove.id);
      setSuccessMessage(t('teams.memberRemovedSuccess'));
      setSuccessReload(true);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Failed to remove member:', err);
      alert(t('teams.failedToRemove') || 'Failed to remove member');
    }
  };

  const handleDownload = async (file: TaskFile) => {
    setDownloadingFileId(file.id);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/tasks/files/${file.id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloadingFileId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'status-open';
      case 'in_progress': return 'status-progress';
      case 'closed': return 'status-closed';
      default: return '';
    }
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="team-detail-page">
      <div className="team-header">
        <div className="team-header-content">
          <h1 className="team-title">
            <span className="title-gradient">{team.name}</span>
          </h1>
          <p className="team-objective">{team.objective}</p>
        </div>
        <div className="team-header-meta">
          <select
            className={`team-status-select ${team.status}`}
            value={team.status}
            onChange={(e) => handleStatusChangeClick(e.target.value)}
            disabled={!canChangeStatus}
          >
            <option value="active">{t('teams.active') || 'Active'}</option>
            <option value="finished">{t('teams.finished') || 'Finished'}</option>
            {isLeader && <option value="__delete__">{t('teams.deleteTeam')}</option>}
          </select>
          <span className="team-members-count">
            {team.members.length}/{team.maxUsers || '∞'}
          </span>
        </div>
      </div>

      <div className="team-section">
        <div className="section-header">
          <h2 className="team-section-title">{t('teams.members')} ({team.members.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {isLeader && (
              <button className="btn btn-primary btn-small" onClick={() => {
                setEditTeamName(team.name);
                setEditTeamObjective(team.objective || '');
                setEditTeamTags(team.tags ? [...team.tags] : []);
                setShowEditTeamModal(true);
              }}>
                {t('teams.editTeam')}
              </button>
            )}
            {isLeader && (
              <button className="btn btn-primary btn-small" onClick={() => setShowAddMemberModal(true)}>
                + {t('teams.addMember') || 'Add Member'}
              </button>
            )}
          </div>
        </div>
        <div className="members-list">
          {team.members.map((member) => (
            <div key={member.id} className="member-card">
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img src={member.avatar} alt={member.username} className="member-avatar" />
                <span className={`status-indicator ${(onlineFriendIds.has(member.id) || memberOnlineStatus[member.id] || member.id === user?.id) ? 'online' : 'offline'}`} style={{ position: 'absolute', bottom: 0, right: 0 }} />
              </div>
              <Link to={`/profile/${member.id}`} className="member-name">{member.username}</Link>
              <span className={`member-role ${member.role.toLowerCase()}`}>{member.role}</span>
              {isLeader && member.id !== user.id && (
                <button className="btn-remove-member" onClick={() => handleRemoveMember(member)} title={t('teams.removeMember') || 'Remove member'}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
              {member.id === user.id && !isLeader && (
                <button className="btn-remove-member" onClick={() => setShowLeaveConfirm(true)} title={t('teams.leaveTeam')}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {isLeader && joinRequests.length > 0 && (
        <div className="team-section">
          <div className="section-header">
            <h2 className="team-section-title">{t('teams.joinRequests')} ({joinRequests.length})</h2>
          </div>
          <div className="members-list">
            {joinRequests.map((request) => (
              <div key={request.request_id} className="member-card">
                <img
                  src={getAvatarUrl(request.avatar_url)}
                  alt={request.username}
                  className="member-avatar"
                />
                <Link to={`/profile/${request.user_id}`} className="member-name">{request.username}</Link>
                <span className="member-role pending">{t('teams.pending')}</span>
                <div className="member-actions">
                  <button
                    className="btn btn-primary btn-small"
                    onClick={() => handleAcceptJoinRequest(request.request_id)}
                  >
                    {t('teams.accept')}
                  </button>
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={() => handleRejectJoinRequest(request.request_id)}
                  >
                    {t('teams.reject')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="team-section">
        <div className="section-header">
          <div className="task-counts">
            <span className="task-counts-label">{t('tasks.title')}:</span>
            <span className="task-count total">{t('tasks.total')}: {taskCounts.total}</span>
            <span className="task-count open">{t('tasks.open')}: {taskCounts.open}</span>
            <span className="task-count in_progress">{t('tasks.inProgress')}: {taskCounts.in_progress}</span>
            <span className="task-count closed">{t('tasks.done')}: {taskCounts.closed}</span>
          </div>
          {canEdit && (
            <button className="btn btn-primary btn-small" onClick={() => setShowTaskForm(!showTaskForm)}>
              {showTaskForm ? t('common.cancel') : '+ ' + t('tasks.createTask')}
            </button>
          )}
        </div>

        {showTaskForm && (
          <form onSubmit={handleAddTask} className="task-form">
            <input
              type="text"
              placeholder={t('teams.taskTitle')}
              className="input"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              required
            />
            <textarea
              placeholder={t('tasks.description')}
              className="input textarea"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              rows={2}
            />
            <div className="task-form-row">
              <div className="assignee-dropdown-wrapper" ref={formAssigneeRef}>
                <button
                  type="button"
                  className="input assignee-dropdown-trigger"
                  onClick={() => setShowFormAssigneeDropdown(!showFormAssigneeDropdown)}
                >
                  <span className="dropdown-arrow">&#9660;</span>
                  {newTask.assignedTo.length > 0
                    ? newTask.assignedTo.join(', ')
                    : t('teams.assignTo')
                  }
                </button>
                {showFormAssigneeDropdown && (
                  <div className="assignee-dropdown-panel" id="form-assignee-panel">
                    {team.members.map((member) => (
                      <label key={member.id} className="assignee-dropdown-option">
                        <input
                          type="checkbox"
                          checked={newTask.assignedTo.includes(member.username)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewTask({ ...newTask, assignedTo: [...newTask.assignedTo, member.username] });
                            } else {
                              setNewTask({ ...newTask, assignedTo: newTask.assignedTo.filter(u => u !== member.username) });
                            }
                          }}
                        />
                        <span>{member.username}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <select
                className="input"
                value={newTask.status}
                onChange={(e) => setNewTask({ ...newTask, status: e.target.value as Task['status'] })}
              >
                <option value="open">{t('tasks.open')}</option>
                <option value="in_progress">{t('tasks.inProgress')}</option>
                <option value="closed">{t('tasks.done')}</option>
              </select>
              <button type="submit" className="btn btn-primary">{t('teams.addTask')}</button>
            </div>
          </form>
        )}

        <div className="task-filters">
          <select
            className="input filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">{t('teams.allStatus')}</option>
            <option value="open">{t('tasks.open')}</option>
            <option value="in_progress">{t('tasks.inProgress')}</option>
            <option value="closed">{t('tasks.done')}</option>
          </select>
          <select
            className="input filter-select"
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
          >
            <option value="all">{t('teams.allAssignees')}</option>
            {team.members.map((member) => (
              <option key={member.id} value={member.username}>{member.username}</option>
            ))}
          </select>
        </div>

        <div className="tasks-table">
          <div className="tasks-header">
            <span>{t('teams.title_col')}</span>
            <span>{t('teams.description')}</span>
            <span>{t('teams.status_col')}</span>
            <span>{t('teams.assignedTo_col')}</span>
            <span>{t('teams.files_col')}</span>
          </div>
          {filteredTasks.map((task) => (
            <div key={task.id} className="task-row">
              <span className="task-title">{task.title}</span>
              <span className="task-description">{task.description}</span>
              {canEdit ? (
                <select
                  className="task-status-select"
                  value={task.status}
                  onChange={(e) => handleTaskStatusChange(task.id, e.target.value as Task['status'])}
                >
                  <option value="open">{t('tasks.open')}</option>
                  <option value="in_progress">{t('tasks.inProgress')}</option>
                  <option value="closed">{t('tasks.done')}</option>
                </select>
              ) : (
                <span className={`task-status ${getStatusColor(task.status)}`}>
                  {task.status.replace('_', ' ')}
                </span>
              )}
              {canEdit ? (
                <div className="assignee-dropdown-wrapper">
                  <button
                    type="button"
                    className="assigned-select assignee-dropdown-trigger"
                    id={`assignee-trigger-${task.id}`}
                    onClick={() => setOpenAssigneeTask(openAssigneeTask === task.id ? null : task.id)}
                  >
                    {task.assignedTo && task.assignedTo.length > 0
                      ? task.assignedTo.map((a: { username: string }) => a.username).join(', ')
                      : t('teams.unassigned')
                    }
                  </button>
                  {openAssigneeTask === task.id && (
                    <div
                      className="assignee-dropdown-panel"
                      id={`assignee-panel-${task.id}`}
                    >
                      {team.members.map((member) => {
                        const isAssigned = task.assignedTo?.some((a: { id: number }) => a.id === member.id) ?? false;
                        return (
                          <label key={member.id} className="assignee-dropdown-option">
                            <input
                              type="checkbox"
                              checked={isAssigned}
                              onChange={() => {
                                const current = team.members.filter((m: Member) =>
                                  (task.assignedTo || []).some((a: { id: number }) => a.id === m.id)
                                );
                                const updated = isAssigned
                                  ? current.filter((m: Member) => m.id !== member.id)
                                  : [...current, member];
                                handleAssigneeChange(task.id, updated);
                              }}
                            />
                            <span>{member.username}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <span className="task-assigned">
                  {task.assignedTo && task.assignedTo.length > 0
                    ? task.assignedTo.map((a: { id: number; username: string }, i: number) => (
                        <span key={a.id}>
                          {i > 0 && ', '}
                          <Link to={`/profile/${a.id}`}>{a.username}</Link>
                        </span>
                      ))
                    : '-'
                  }
                </span>
              )}
              <span className="task-files">
                <input
                  type="file"
                  accept={ALLOWED_TASK_EXTENSIONS}
                  ref={(el) => { if (el) fileInputRefs.current[task.id] = el; }}
                  onChange={() => handleFileUpload(task.id)}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className="file-upload-btn"
                  onClick={() => fileInputRefs.current[task.id]?.click()}
                  disabled={!canEdit}
                  title={t('teams.uploadFile')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75z" clipRule="evenodd" />
                    <path d="M12.53 16.28a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 011.06-1.06l4.5 4.5 4.5-4.5a.75.75 0 111.06 1.06l-4.5 4.5z" />
                  </svg>
                  <span>{t('teams.uploadFile')}</span>
                </button>
                {task.files.length > 0 ? (
                  task.files.map((file: TaskFile) => (
                    <span key={file.id} className="file-item">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="file-icon">
                        <path fillRule="evenodd" d="M4.5 3.75a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75zm0 5a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75zm0 5a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                      </svg>
                      <span
                        className="file-link"
                        onClick={() => handleDownload(file)}
                        style={{ cursor: 'pointer' }}
                      >
                        {downloadingFileId === file.id ? t('teams.downloading') || '...' : file.file_name}
                      </span>
                      {canEdit && (
                        <button
                          type="button"
                          className="file-delete-btn"
                          onClick={() => { setFileToDelete({ taskId: task.id, fileId: file.id }); setShowDeleteFileConfirm(true); }}
                          title={t('teams.deleteFile', { defaultValue: 'Delete file' })}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '0.875rem', height: '0.875rem' }}>
                            <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </span>
                  ))
                ) : null}
                {task.creatorId === user.id && (
                  <button
                    type="button"
                    className="file-upload-btn"
                    onClick={() => { setTaskToDelete(task.id); setShowDeleteTaskConfirm(true); }}
                    title={t('teams.deleteTask', { defaultValue: 'Delete task' })}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '1rem', height: '1rem' }}>
                      <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" />
                    </svg>
                    <span>{t('teams.deleteTask', { defaultValue: 'Delete task' })}</span>
                  </button>
                )}
              </span>
            </div>
          ))}
          {filteredTasks.length === 0 && (
            <div className="tasks-empty">{t('teams.noTasksMatch')}</div>
          )}
        </div>
      </div>

      <div className="team-section">
        <h2 className="team-section-title">{t('teams.chat')}</h2>
        <div className="chat-container">
          <div className="chat-messages">
            {team.chat && team.chat.length > 0 ? (
              team.chat.map((msg) => (
                <div key={msg.id} className={`chat-message ${msg.sender.username === user.username ? 'own' : ''}`}>
                  <img src={msg.sender.avatar} alt={msg.sender.username} className="chat-avatar" />
                  <div className="chat-content">
                    <Link to={`/profile/${msg.sender.id}`} className="chat-username">{msg.sender.username}</Link>
                    <span className="chat-time">{formatTime(msg.timestamp)}</span>
                    <p className="chat-text">{msg.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="chat-empty">{t('teams.noMessages')}. {t('teams.startConversation')}</p>
            )}
          </div>
          <form onSubmit={handleSendMessage} className="chat-input-container">
            <input
              type="text"
              placeholder={isActive ? t('teams.typeMessage') : t('teams.chatDisabled')}
              className="chat-input"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              disabled={!canEdit}
            />
            <button type="submit" className="btn btn-primary chat-send" disabled={!canEdit}>{t('teams.send')}</button>
          </form>
        </div>
      </div>

      {showStatusModal && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('teams.changeStatus')}</h2>
              <button className="modal-close" onClick={() => setShowStatusModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p className="modal-message">{t('teams.confirmStatus')} {newStatus === 'active' ? t('teams.active') : t('teams.finished')}?</p>
              {newStatus === 'finished' && (
                <p className="modal-message" style={{ color: 'var(--color-error, #ef4444)', marginTop: '0.5rem', fontWeight: 600 }}>
                  {t('teams.cannotReopenNotice') || 'This action cannot be undone.'}
                </p>
              )}
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setShowStatusModal(false)}>{t('common.cancel')}</button>
                <button className="btn btn-primary" onClick={handleConfirmStatusChange}>{t('common.confirm')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFinishedError && (
        <div className="modal-overlay" onClick={() => setShowFinishedError(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('common.info')}</h2>
              <button className="modal-close" onClick={() => setShowFinishedError(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p className="modal-message">{t('teams.cannotReopenFinished')}</p>
              <div className="modal-actions">
                <button className="btn btn-primary" onClick={() => setShowFinishedError(false)}>{t('common.close')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLeaveConfirm && (
        <div className="modal-overlay" onClick={() => setShowLeaveConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('teams.leaveTeam')}</h2>
              <button className="modal-close" onClick={() => setShowLeaveConfirm(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p className="modal-message">{t('teams.confirmLeave')}</p>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setShowLeaveConfirm(false)}>{t('common.cancel')}</button>
                <button className="btn btn-danger" onClick={handleLeaveTeam}>{t('teams.leave')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('teams.deleteTeam')}</h2>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p className="modal-message">{t('teams.confirmDelete') || 'Are you sure you want to delete this team? This action cannot be undone.'}</p>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>{t('common.cancel')}</button>
                <button className="btn btn-danger" onClick={handleDeleteTeam}>{t('common.delete')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFileError && (
        <div className="modal-overlay" onClick={() => setShowFileError(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('common.error')}</h2>
              <button className="modal-close" onClick={() => setShowFileError(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p className="modal-message">{fileErrorMessage}</p>
              <div className="modal-actions">
                <button className="btn btn-primary" onClick={() => setShowFileError(false)}>{t('common.close')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteTaskConfirm && (
        <div className="modal-overlay" onClick={() => { setShowDeleteTaskConfirm(false); setTaskToDelete(null); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('teams.deleteTask', { defaultValue: 'Delete task' })}</h2>
              <button className="modal-close" onClick={() => { setShowDeleteTaskConfirm(false); setTaskToDelete(null); }}>&times;</button>
            </div>
            <div className="modal-body">
              <p className="modal-message">{t('teams.confirmDeleteTask', { defaultValue: 'Are you sure you want to delete this task? All associated files will also be deleted.' })}</p>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => { setShowDeleteTaskConfirm(false); setTaskToDelete(null); }}>{t('common.cancel')}</button>
                <button className="btn btn-danger" onClick={handleConfirmDeleteTask}>{t('common.delete')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteFileConfirm && (
        <div className="modal-overlay" onClick={() => { setShowDeleteFileConfirm(false); setFileToDelete(null); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('teams.deleteFile', { defaultValue: 'Delete file' })}</h2>
              <button className="modal-close" onClick={() => { setShowDeleteFileConfirm(false); setFileToDelete(null); }}>&times;</button>
            </div>
            <div className="modal-body">
              <p className="modal-message">{t('teams.confirmDeleteFile', { defaultValue: 'Are you sure you want to delete this file?' })}</p>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => { setShowDeleteFileConfirm(false); setFileToDelete(null); }}>{t('common.cancel')}</button>
                <button className="btn btn-danger" onClick={handleConfirmDeleteFile}>{t('common.delete')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddMemberModal && (
        <div className="modal-overlay" onClick={() => setShowAddMemberModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('teams.addMemberTitle')}</h2>
              <button className="modal-close" onClick={() => setShowAddMemberModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="add-member-method">
                <label className="input-label">{t('teams.selectUser')}</label>
                <div className="add-member-row">
                  {loadingUsers && allUsers.length === 0 ? (
                    <span className="loading-text">{t('common.loading')}</span>
                  ) : (
                    <>
                      <select className="input" value={selectedFriend} onChange={(e) => setSelectedFriend(e.target.value)}>
                        <option value="">{t('teams.selectUser')}</option>
                        {availableUsers.map((u) => (<option key={u.id} value={u.username}>{u.username}</option>))}
                      </select>
                      <button className="btn btn-primary" onClick={handleAddMemberFromDropdown}>{t('teams.addMember')}</button>
                    </>
                  )}
                </div>
              </div>
              <div className="add-member-divider">{t('teams.or')}</div>
              <div className="add-member-method">
                <label className="input-label">{t('teams.addByUsername')}</label>
                <div className="add-member-row">
                  <input type="text" placeholder={t('teams.enterUsername')} className="input" value={manualUsername} onChange={(e) => setManualUsername(e.target.value)} />
                  <button className="btn btn-primary" onClick={handleAddMemberManual} disabled={loadingUsers}>{loadingUsers ? '...' : t('teams.addUser')}</button>
                </div>
              </div>
              {errorUsers && <p className="error-text">{errorUsers}</p>}
            </div>
          </div>
        </div>
      )}

      {showRemoveMemberModal && (
        <div className="modal-overlay" onClick={() => setShowRemoveMemberModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('teams.removeMember')}</h2>
              <button className="modal-close" onClick={() => setShowRemoveMemberModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p className="modal-message">{t('teams.confirmRemove')} {memberToRemove?.username} {t('teams.fromTeam') || 'from the team'}?</p>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setShowRemoveMemberModal(false)}>{t('common.cancel')}</button>
                <button className="btn btn-danger" onClick={handleConfirmRemove}>{t('teams.remove')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTeamFullModal && (
        <div className="modal-overlay" onClick={() => setShowTeamFullModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('teams.teamFullTitle') || 'Team Full'}</h2>
              <button className="modal-close" onClick={() => setShowTeamFullModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p className="modal-message">{t('teams.teamFull') || 'Team is already full'}</p>
              <div className="modal-actions">
                <button className="btn btn-primary" onClick={() => setShowTeamFullModal(false)}>{t('common.close')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showEditTeamModal && (
        <div className="modal-overlay" onClick={() => setShowEditTeamModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('teams.editTeam')}</h2>
              <button className="modal-close" onClick={() => setShowEditTeamModal(false)}>&times;</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveTeamSettings(); }} className="modal-body">
              <div className="form-group">
                <label className="input-label">{t('teams.teamName')}</label>
                <input
                  type="text"
                  className="input"
                  value={editTeamName}
                  onChange={(e) => setEditTeamName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="input-label">{t('teams.teamDescription')}</label>
                <textarea
                  className="input textarea"
                  value={editTeamObjective}
                  onChange={(e) => setEditTeamObjective(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label className="input-label">{t('teams.details') || 'Details'}</label>
                <div className="team-details-select">
                  {['DB', 'API', 'Frontend', 'Backend', 'Auth', 'Testing', 'DevOps', 'UI/UX', 'Security', 'Docs'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className={`detail-tag ${editTeamTags.includes(tag) ? 'selected' : ''}`}
                      onClick={() => toggleEditTag(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditTeamModal(false)}>{t('common.cancel')}</button>
                <button type="submit" className="btn btn-primary">{t('teams.saveSettings')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showSuccessModal && (
        <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('common.success')}</h2>
              <button className="modal-close" onClick={() => setShowSuccessModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p className="modal-message">{successMessage}</p>
              <div className="modal-actions">
                <button className="btn btn-primary" onClick={() => { setShowSuccessModal(false); if (successReload) window.location.reload(); }}>OK</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamDetail;