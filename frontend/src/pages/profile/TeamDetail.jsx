import { useContext, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function TeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, leaveTeam, addChatMessage, updateTaskStatus, addTask, uploadFile, updateTaskAssignee, addTeamMember, findUserByUsername, removeTeamMember, updateTeamStatus } = useContext(AuthContext);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', assignedTo: '', status: 'to_do' });
  const [statusFilter, setStatusFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState('');
  const [manualUsername, setManualUsername] = useState('');
  const [memberRole, setMemberRole] = useState('Member');
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const fileInputRefs = useRef({});

  // TODO: Send GET /api/teams/{id}, receive {team with all relations (members, tasks, chat)}
  const team = user?.teams.find((t) => t.id === parseInt(id));
  const isLeader = team?.role === 'Leader';
  const isActive = team?.status === 'active';
  const canEdit = team && isActive;
  const canChangeStatus = isLeader;

  const taskCounts = {
    total: team?.tasks.length || 0,
    to_do: team?.tasks.filter((t) => t.status === 'to_do').length || 0,
    in_progress: team?.tasks.filter((t) => t.status === 'in_progress').length || 0,
    done: team?.tasks.filter((t) => t.status === 'done').length || 0,
  };

  if (!team) {
    return (
      <div className="team-detail-page">
        <h1>Team not found</h1>
        <p>This team does not exist or you are not a member.</p>
      </div>
    );
  }

  const filteredTasks = team.tasks.filter((task) => {
    const statusMatch = statusFilter === 'all' || task.status === statusFilter;
    const assigneeMatch = assigneeFilter === 'all' || task.assignedTo?.username === assigneeFilter;
    return statusMatch && assigneeMatch;
  });

  const handleLeaveTeam = () => {
    leaveTeam(team.id);
    navigate('/profile/teams');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !canEdit) return;
    const message = {
      id: Date.now(),
      username: user.username,
      avatar: user.avatar,
      text: chatMessage,
      timestamp: new Date().toISOString(),
    };
    addChatMessage(team.id, message);
    setChatMessage('');
  };

  const handleStatusChangeClick = (status) => {
    setNewStatus(status);
    setShowStatusModal(true);
  };

  const handleConfirmStatusChange = () => {
    updateTeamStatus(team.id, newStatus);
    setShowStatusModal(false);
    setNewStatus('');
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.title.trim() || !canEdit) return;
    const assignedMember = team.members.find(m => m.username === newTask.assignedTo);
    addTask(team.id, {
      title: newTask.title,
      description: newTask.description,
      status: newTask.status,
      assignedTo: assignedMember || null,
      files: [],
    });
    setNewTask({ title: '', description: '', assignedTo: '', status: 'to_do' });
    setShowTaskForm(false);
  };

  const handleTaskStatusChange = (taskId, newStatus) => {
    if (!canEdit) return;
    updateTaskStatus(team.id, taskId, newStatus);
  };

  const handleAssigneeChange = (taskId, memberUsername) => {
    if (!canEdit) return;
    const member = team.members.find(m => m.username === memberUsername);
    updateTaskAssignee(team.id, taskId, member || null);
  };

  // TODO: Send actual file - POST /api/tasks/{taskId}/files with FormData
  const handleFileUpload = (taskId) => {
    if (!canEdit) return;
    const input = fileInputRefs.current[taskId];
    if (input && input.files.length > 0) {
      const file = input.files[0];
      const mockSize = (Math.random() * 10).toFixed(1) + 'KB';
      uploadFile(team.id, taskId, { name: file.name, size: mockSize });
      input.value = '';
    }
  };

  const handleAddMemberFromDropdown = () => {
    if (!selectedFriend || !canEdit) return;
    const friend = user.friends.find((f) => f.username === selectedFriend);
    if (friend) {
      addTeamMember(team.id, friend, memberRole);
      setSelectedFriend('');
      setMemberRole('Member');
      setShowAddMemberModal(false);
    }
  };

  const handleAddMemberManual = () => {
    if (!manualUsername.trim() || !canEdit) return;
    const foundUser = findUserByUsername(manualUsername.trim());
    if (foundUser) {
      addTeamMember(team.id, foundUser, memberRole);
      setManualUsername('');
      setMemberRole('Member');
      setShowAddMemberModal(false);
    }
  };

  const handleRemoveMember = (member) => {
    if (!canEdit) return;
    setMemberToRemove(member);
    setShowRemoveMemberModal(true);
  };

  const handleConfirmRemove = () => {
    if (!canEdit || !memberToRemove) return;
    removeTeamMember(team.id, memberToRemove.id);
    setShowRemoveMemberModal(false);
    setMemberToRemove(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'to_do': return 'status-todo';
      case 'in_progress': return 'status-progress';
      case 'done': return 'status-done';
      default: return '';
    }
  };

  const formatTime = (timestamp) => {
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
          {team.details && team.details.length > 0 && (
            <div className="team-details">
              {team.details.map((detail) => (
                <span key={detail} className="team-detail-tag">{detail}</span>
              ))}
            </div>
          )}
        </div>
        <div className="team-header-meta">
          <select
            className={`team-status-select ${team.status}`}
            value={team.status}
            onChange={(e) => handleStatusChangeClick(e.target.value)}
            disabled={!canChangeStatus}
          >
            <option value="active">Active</option>
            <option value="finished">Finished</option>
          </select>
          <span className="team-members-count">
            {team.members.length}/{team.lookingFor || '∞'}
          </span>
        </div>
      </div>

      <div className="team-section">
        <div className="section-header">
          <h2 className="team-section-title">Members ({team.members.length})</h2>
          {canEdit && (
            <button className="btn btn-primary btn-small" onClick={() => setShowAddMemberModal(true)}>
              + Add Member
            </button>
          )}
        </div>
        <div className="members-list">
          {team.members.map((member) => (
            <div key={member.id} className="member-card">
              <img src={member.avatar} alt={member.username} className="member-avatar" />
              <span className="member-name">{member.username}</span>
              <span className={`member-role ${member.role.toLowerCase()}`}>{member.role}</span>
              {canEdit && member.id !== user.id && (
                <button className="btn-remove-member" onClick={() => handleRemoveMember(member)} title="Remove member">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="team-section">
        <div className="section-header">
          <div className="task-counts">
            <span className="task-counts-label">Tasks:</span>
            <span className="task-count total">Total: {taskCounts.total}</span>
            <span className="task-count to_do">To Do: {taskCounts.to_do}</span>
            <span className="task-count in_progress">In Progress: {taskCounts.in_progress}</span>
            <span className="task-count done">Done: {taskCounts.done}</span>
          </div>
          {canEdit && (
            <button className="btn btn-primary btn-small" onClick={() => setShowTaskForm(!showTaskForm)}>
              {showTaskForm ? 'Cancel' : '+ New Task'}
            </button>
          )}
        </div>

        {showTaskForm && (
          <form onSubmit={handleAddTask} className="task-form">
            <input
              type="text"
              placeholder="Task title"
              className="input"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              required
            />
            <textarea
              placeholder="Description"
              className="input textarea"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              rows={2}
            />
            <div className="task-form-row">
              <select
                className="input"
                value={newTask.assignedTo}
                onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
              >
                <option value="">Assign to...</option>
                {team.members.map((member) => (
                  <option key={member.id} value={member.username}>{member.username}</option>
                ))}
              </select>
              <select
                className="input"
                value={newTask.status}
                onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
              >
                <option value="to_do">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              <button type="submit" className="btn btn-primary">Add</button>
            </div>
          </form>
        )}

        <div className="task-filters">
          <select
            className="input filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="to_do">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <select
            className="input filter-select"
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
          >
            <option value="all">All Assignees</option>
            {team.members.map((member) => (
              <option key={member.id} value={member.username}>{member.username}</option>
            ))}
          </select>
        </div>

        <div className="tasks-table">
          <div className="tasks-header">
            <span>Title</span>
            <span>Description</span>
            <span>Status</span>
            <span>Assigned To</span>
            <span>Files</span>
          </div>
          {filteredTasks.map((task) => (
            <div key={task.id} className="task-row">
              <span className="task-title">{task.title}</span>
              <span className="task-description">{task.description}</span>
              {canEdit ? (
                <select
                  className="task-status-select"
                  value={task.status}
                  onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                >
                  <option value="to_do">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              ) : (
                <span className={`task-status ${getStatusColor(task.status)}`}>
                  {task.status.replace('_', ' ')}
                </span>
              )}
              {canEdit ? (
                <select
                  className="assigned-select"
                  value={task.assignedTo?.username || ''}
                  onChange={(e) => handleAssigneeChange(task.id, e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {team.members.map((member) => (
                    <option key={member.id} value={member.username}>{member.username}</option>
                  ))}
                </select>
              ) : (
                <span className="task-assigned">{task.assignedTo ? task.assignedTo.username : '-'}</span>
              )}
              <span className="task-files">
                <input
                  type="file"
                  ref={(el) => (fileInputRefs.current[task.id] = el)}
                  onChange={() => handleFileUpload(task.id)}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className="file-upload-btn"
                  onClick={() => fileInputRefs.current[task.id]?.click()}
                  disabled={!canEdit}
                  title="Upload file"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75z" clipRule="evenodd" />
                    <path d="M12.53 16.28a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 011.06-1.06l4.5 4.5 4.5-4.5a.75.75 0 111.06 1.06l-4.5 4.5z" />
                  </svg>
                </button>
                {task.files.length > 0 ? (
                  task.files.map((file, idx) => (
                    <span key={idx} className="file-item">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="file-icon">
                        <path fillRule="evenodd" d="M4.5 3.75a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75zm0 5a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75zm0 5a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                      </svg>
                      {file.name}
                    </span>
                  ))
                ) : null}
              </span>
            </div>
          ))}
          {filteredTasks.length === 0 && (
            <div className="tasks-empty">No tasks match the selected filters.</div>
          )}
        </div>
      </div>

      <div className="team-section">
        <h2 className="team-section-title">Team Chat</h2>
        <div className="chat-container">
          <div className="chat-messages">
            {team.chat && team.chat.length > 0 ? (
              team.chat.map((msg) => (
                <div key={msg.id} className={`chat-message ${msg.username === user.username ? 'own' : ''}`}>
                  <img src={msg.avatar} alt={msg.username} className="chat-avatar" />
                  <div className="chat-content">
                    <span className="chat-username">{msg.username}</span>
                    <span className="chat-time">{formatTime(msg.timestamp)}</span>
                    <p className="chat-text">{msg.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="chat-empty">No messages yet. Start the conversation!</p>
            )}
          </div>
          <form onSubmit={handleSendMessage} className="chat-input-container">
            <input
              type="text"
              placeholder={isActive ? "Type a message..." : "Chat disabled - team is finished"}
              className="chat-input"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              disabled={!canEdit}
            />
            <button type="submit" className="btn btn-primary chat-send" disabled={!canEdit}>Send</button>
          </form>
        </div>
      </div>

      {showStatusModal && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Change Team Status</h2>
              <button className="modal-close" onClick={() => setShowStatusModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p className="remove-member-message">
                Are you sure you want to set this team as {newStatus}?
              </p>
              <div className="remove-member-actions">
                <button className="btn btn-secondary" onClick={() => setShowStatusModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleConfirmStatusChange}>Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddMemberModal && (
        <div className="modal-overlay" onClick={() => setShowAddMemberModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Member</h2>
              <button className="modal-close" onClick={() => setShowAddMemberModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="add-member-method">
                <label className="input-label">Select from Friends</label>
                <div className="add-member-row">
                  <select
                    className="input"
                    value={selectedFriend}
                    onChange={(e) => setSelectedFriend(e.target.value)}
                  >
                    <option value="">Select a friend...</option>
                    {user.friends
                      .filter((f) => !team.members.some((m) => m.id === f.id))
                      .map((friend) => (
                        <option key={friend.id} value={friend.username}>{friend.username}</option>
                      ))}
                  </select>
                  <button className="btn btn-primary" onClick={handleAddMemberFromDropdown}>Add</button>
                </div>
              </div>
              <div className="add-member-divider">OR</div>
              <div className="add-member-method">
                <label className="input-label">Add by Username</label>
                <div className="add-member-row">
                  <input
                    type="text"
                    placeholder="Enter username"
                    className="input"
                    value={manualUsername}
                    onChange={(e) => setManualUsername(e.target.value)}
                  />
                  <button className="btn btn-primary" onClick={handleAddMemberManual}>Add</button>
                </div>
              </div>
              <div className="add-member-role">
                <label className="input-label">Role:</label>
                <select
                  className="input"
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                >
                  <option value="Member">Member</option>
                  <option value="Leader">Leader</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRemoveMemberModal && (
        <div className="modal-overlay" onClick={() => setShowRemoveMemberModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Remove Member</h2>
              <button className="modal-close" onClick={() => setShowRemoveMemberModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p className="remove-member-message">
                Are you sure you want to remove {memberToRemove?.username} from the team?
              </p>
              <div className="remove-member-actions">
                <button className="btn btn-secondary" onClick={() => setShowRemoveMemberModal(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleConfirmRemove}>Remove</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="team-actions">
        {showLeaveConfirm ? (
          <div className="leave-confirm">
            <p>Are you sure you want to leave this team?</p>
            <div className="leave-confirm-buttons">
              <button className="btn btn-secondary" onClick={() => setShowLeaveConfirm(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleLeaveTeam}>Confirm Leave</button>
            </div>
          </div>
        ) : (
          <button className="btn btn-outline-danger" onClick={() => setShowLeaveConfirm(true)}>Leave Team</button>
        )}
      </div>
    </div>
  );
}

export default TeamDetail;