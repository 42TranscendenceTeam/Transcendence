import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const TEAM_DETAILS = [
  'DB',
  'API',
  'Frontend',
  'Backend',
  'Auth',
  'Testing',
  'DevOps',
  'UI/UX',
  'Security',
  'Docs',
];

const MOCK_TEAMS = [
  {
    id: 101,
    name: 'Mobile App Project',
    objective: 'Building a cross-platform mobile application for campus events',
    lookingFor: 3,
    details: ['Frontend', 'API', 'UI/UX'],
    status: 'open',
    members: [
      { id: 10, username: 'Sophie', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie', role: 'Leader' },
    ],
  },
  {
    id: 102,
    name: 'AI Chatbot',
    objective: 'Creating an AI-powered chatbot for student support',
    lookingFor: 4,
    details: ['Backend', 'API', 'DB', 'Testing'],
    status: 'open',
    members: [
      { id: 11, username: 'Ryan', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan', role: 'Leader' },
      { id: 12, username: 'Emma', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', role: 'Member' },
    ],
  },
  {
    id: 103,
    name: 'E-commerce Platform',
    objective: 'Developing a full-stack e-commerce solution for local vendors',
    lookingFor: 5,
    details: ['Frontend', 'Backend', 'DB', 'Security', 'DevOps'],
    status: 'open',
    members: [
      { id: 13, username: 'Oscar', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oscar', role: 'Leader' },
    ],
  },
];

function Teams() {
  const { user, createTeam } = useContext(AuthContext);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    lookingFor: 2,
    details: [] as string[],
  });
  const [showDiscovery, setShowDiscovery] = useState(false);

  if (!user) {
    return null;
  }

  const userTeamIds = user.teams.map((t) => t.id);
  const availableTeams = MOCK_TEAMS.filter((t) => !userTeamIds.includes(t.id));

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.name.trim() || !newTeam.description.trim()) return;
    createTeam(newTeam);
    setNewTeam({ name: '', description: '', lookingFor: 2, details: [] });
    setShowCreateModal(false);
  };

  const toggleDetail = (detail: string) => {
    setNewTeam((prev) => ({
      ...prev,
      details: prev.details.includes(detail)
        ? prev.details.filter((d) => d !== detail)
        : [...prev.details, detail],
    }));
  };

  const handleJoinTeam = (team: typeof MOCK_TEAMS[0]) => {
    alert(`Join request for "${team.name}" - This feature is coming soon!`);
  };

  return (
    <div className="teams-page">
      <div className="teams-header">
        <h1 className="profile-page-title">Teams</h1>
        <div className="teams-header-buttons">
          <button
            className={`btn btn-small ${showDiscovery ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowDiscovery(!showDiscovery)}
          >
            {showDiscovery ? 'My Teams' : 'Discover Teams'}
          </button>
          <button className="btn btn-primary btn-small" onClick={() => setShowCreateModal(true)}>
            + Create Team
          </button>
        </div>
      </div>

      {!showDiscovery && (
        <>
          <p className="profile-page-subtitle">You are in {user.teams.length} active teams</p>

          <div className="teams-list">
            {user.teams.map((team) => (
              <Link key={team.id} to={`/teams/${team.id}`} className="team-card">
                <div className="team-info">
                  <span className="team-name">{team.name}</span>
                  <span className="team-role">{team.role}</span>
                </div>
                <span className={`team-status ${team.status}`}>{team.status}</span>
              </Link>
            ))}
          </div>

          {user.teams.length === 0 && (
            <div className="empty-state">
              <p>You are not in any team yet.</p>
              <p className="empty-hint">Find collaborators on the home page!</p>
            </div>
          )}
        </>
      )}

      {showDiscovery && (
        <>
          <p className="profile-page-subtitle">Open teams you can join</p>

          <div className="teams-list">
            {availableTeams.map((team) => (
              <div key={team.id} className="team-card discovery-team-card">
                <div className="team-info">
                  <span className="team-name">{team.name}</span>
                  <span className="team-description">{team.objective}</span>
                  <div className="team-details">
                    {team.details.map((detail) => (
                      <span key={detail} className="team-detail-tag">{detail}</span>
                    ))}
                  </div>
                </div>
                <div className="team-meta">
                  <span className="team-members-count">{team.members.length}/{team.lookingFor}</span>
                  <button className="btn btn-secondary btn-small" onClick={() => handleJoinTeam(team)}>
                    Join
                  </button>
                </div>
              </div>
            ))}
          </div>

          {availableTeams.length === 0 && (
            <div className="empty-state">
              <p>No teams available to join.</p>
              <p className="empty-hint">Check back later!</p>
            </div>
          )}
        </>
      )}

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Team</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateTeam} className="modal-body">
              <div className="form-group">
                <label className="input-label">Team Name</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Enter team name"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="input-label">Description</label>
                <textarea
                  className="input textarea"
                  placeholder="Describe your team's goal"
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="form-group">
                <label className="input-label">Looking for (number of members)</label>
                <input
                  type="number"
                  className="input"
                  min="1"
                  max="10"
                  value={newTeam.lookingFor}
                  onChange={(e) => setNewTeam({ ...newTeam, lookingFor: parseInt(e.target.value) || 2 })}
                />
              </div>

              <div className="form-group">
                <label className="input-label">Details (select all that apply)</label>
                <div className="team-details-select">
                  {TEAM_DETAILS.map((detail) => (
                    <button
                      key={detail}
                      type="button"
                      className={`detail-tag ${newTeam.details.includes(detail) ? 'selected' : ''}`}
                      onClick={() => toggleDetail(detail)}
                    >
                      {detail}
                    </button>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Teams;