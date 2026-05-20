/**
 * Teams List Page Component
 *
 * Displays all teams the user is member of.
 * Uses real API for team data.
 */

import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { api, Team } from '../../services/api';

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

function Teams() {
  const { t } = useTranslation();
  const { user, createTeam, teamInvites, fetchTeamInvites, acceptTeamInvite, rejectTeamInvite } = useContext(AuthContext);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    lookingFor: 2,
    details: [] as string[],
  });
  

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const teamsData = await api.getTeams();
        setTeams(teamsData);
      } catch (err) {
        console.error('Failed to fetch teams:', err);
        setError('Failed to load teams');
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
    fetchTeamInvites();
  }, []);

  if (!user) {
    return null;
  }

  const userTeams = teams.filter((t) => t.isMember);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.name.trim() || !newTeam.description.trim()) return;
    try {
      const createdTeam = await api.createTeam({
        name: newTeam.name,
        objective: newTeam.description,
        maxUsers: newTeam.lookingFor,
        tags: newTeam.details,
      });
      const teamsData = await api.getTeams();
      setTeams(teamsData);
    } catch (err) {
      console.error('Failed to create team:', err);
      alert('Failed to create team');
    }
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

  const pendingInvites = teamInvites;

  return (
    <div className="teams-page">
      <div className="teams-header">
        <h1 className="profile-page-title">{t('teams.title')}</h1>
        <div className="teams-header-buttons">
          <button className="btn btn-primary btn-small" onClick={() => setShowCreateModal(true)}>
            + {t('teams.createTeam')}
          </button>
        </div>
      </div>

      {loading && <div className="loading">Loading teams...</div>}
      {error && <div className="error-text">{error}</div>}

      {!loading && !error && (
        <div className="teams-content">
          {pendingInvites.length > 0 && (
            <div className="profile-section">
              <h2 className="profile-section-title">{t('teams.pendingInvites')}</h2>
              <div className="requests-list">
                {pendingInvites.map((invite) => (
                  <div key={invite.invite_id} className="request-card">
                    <span className="request-username">{invite.team_name}</span>
                    <span className="request-status">{invite.team_about}</span>
                    <button
                      className="btn btn-primary btn-small"
                      onClick={() => acceptTeamInvite(invite.invite_id)}
                    >
                      {t('teams.accept')}
                    </button>
                    <button
                      className="btn btn-outline-danger btn-small"
                      onClick={() => rejectTeamInvite(invite.invite_id)}
                    >
                      {t('teams.reject')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="profile-page-subtitle">{t('teams.youAreIn') || 'You are in'} {userTeams.length} {t('teams.activeTeams') || 'active teams'}</p>

          <div className="teams-list">
            {userTeams.map((team) => (
              <Link key={team.id} to={`/teams/${team.id}`} className="team-card">
                <div className="team-info">
                  <span className="team-name">{team.name}</span>
                  <span className="team-role">{team.role}</span>
                </div>
                <span className={`team-status ${team.status}`}>
                  {team.status === 'active' ? t('teams.active') : team.status === 'finished' ? t('teams.finished') : team.status}
                </span>
              </Link>
            ))}
          </div>

          {userTeams.length === 0 && (
            <div className="empty-state">
              <p>{t('teams.noTeams')}</p>
              <p className="empty-hint">{t('teams.findCollaborators') || 'Find collaborators on the home page!'}</p>
            </div>
          )}
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('teams.createTeam')}</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateTeam} className="modal-body">
              <div className="form-group">
                <label className="input-label">{t('teams.teamName')}</label>
                <input
                  type="text"
                  className="input"
                  placeholder={t('teams.teamNamePlaceholder')}
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="input-label">{t('teams.teamDescription')}</label>
                <textarea
                  className="input textarea"
                  placeholder={t('teams.teamDescriptionPlaceholder')}
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="form-group">
                <label className="input-label">{t('teams.lookingFor') || 'Looking for (number of members)'}</label>
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
                <label className="input-label">{t('teams.details') || 'Details (select all that apply)'}</label>
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
                  {t('common.cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  {t('teams.create')}
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