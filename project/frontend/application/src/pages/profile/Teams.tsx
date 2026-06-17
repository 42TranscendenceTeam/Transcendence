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
import { useError } from '../../context/ErrorContext';
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
  const { showError } = useError();
  const { user, createTeam, teamInvites, fetchTeamInvites, acceptTeamInvite, rejectTeamInvite, teamRefreshTrigger } = useContext(AuthContext);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    lookingFor: 2,
    details: [] as string[],
  });


  useEffect(() => {
    setLoading(true);
    fetchTeamInvites();
    api.getMyTeams().then((myTeams) => {
      if (user) {
        const merged = myTeams.map(team => {
          const contextTeam = user.teams.find(t => t.id === team.id);
          return contextTeam ? { ...team, status: contextTeam.status } : team;
        });
        setTeams(merged);
      } else {
        setTeams(myTeams);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [teamRefreshTrigger]);

  if (!user) {
    return null;
  }

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.name.trim() || !newTeam.description.trim()) return;
    try {
      await createTeam({
        name: newTeam.name,
        description: newTeam.description,
        lookingFor: newTeam.lookingFor,
        details: newTeam.details,
      });
      api.getMyTeams().then((myTeams) => setTeams(myTeams)).catch(() => {});
    } catch {
      showError('Error', 'Failed to create team');
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
      <div className="teams-header mb-2 flex items-center justify-between">
        <h1 className="profile-page-title">{t('teams.title')}</h1>
        <div className="teams-header-buttons flex gap-2">
          <button className="btn btn-accent" onClick={() => setShowCreateModal(true)}>
            + {t('teams.createTeam')}
          </button>
        </div>
      </div>

      {loading && <div className="loading">Loading teams...</div>}
      {error && <div className="error-text">{error}</div>}

      {!loading && !error && (
        <div className="teams-content">
          <p className="profile-page-subtitle">
            {t('teams.youAreIn') || 'You are in'} {teams.length} {t('teams.activeTeams') || 'active teams'}
          </p>

          <div className="teams-list teams-page-list flex flex-col">
            {teams.map((team) => (
              <Link key={team.id} to={`/teams/${team.id}`} className="team-card grid items-center">
                <div className="team-info flex min-w-0 flex-col">
                  <span className="team-name font-medium">{team.name}</span>
                  <span className="team-description block truncate">
                    {team.objective || 'No description added yet.'}
                  </span>
                </div>

                <div className="team-meta grid items-center">
                  <div className="team-meta-item">
                    <span className="team-meta-label block font-medium leading-none">{t('teams.role')}</span>
                    <span className={`team-role inline-center ${team.role?.toLowerCase()}`}>
                      {team.role}
                      {team.role?.toLowerCase() === 'leader' && (
                        <span className="team-role-crown inline-flex items-center justify-center align-middle" aria-hidden="true">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 12 12 6l4.5 6 4.5-4.5L19.5 18h-15L3 7.5Z" />
                          </svg>
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="team-meta-item">
                    <span className="team-meta-label block font-medium leading-none">{t('teams.status')}</span>
                    <span className={`team-status ${team.status} inline-flex w-fit rounded-full`}>
                      {team.status === 'active'
                        ? t('teams.active')
                        : team.status === 'finished'
                          ? t('teams.finished')
                          : team.status}
                    </span>
                  </div>

                  <div className="team-meta-item">
                    <span className="team-meta-label block font-medium leading-none">{t('teams.members')}</span>
                    <span className="team-meta-value">
                      <span className="team-meta-icon inline-flex items-center justify-center" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                          />
                        </svg>
                      </span>

                      {team.memberCount ?? team.members?.length ?? 0}/{team.maxUsers || '∞'}
                    </span>
                  </div>

                  <div className="team-meta-item">
                    <span className="team-meta-label block font-medium leading-none">{t('teams.created')}</span>
                    <span className="team-meta-value">
                      {team.created_at
                        ? new Date(team.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })
                        : '-'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {teams.length === 0 && (
            <div className="empty-state">
              <p>{t('teams.noTeams')}</p>
              <p className="empty-hint">{t('teams.findCollaborators') || 'Find collaborators on the home page!'}</p>
            </div>
          )}

          {pendingInvites.length > 0 && (
            <div className="profile-section">
              <h2 className="profile-section-title">{t('teams.pendingInvites')}</h2>
              <div className="requests-list flex flex-col gap-0 overflow-hidden rounded-xl">
                {pendingInvites.map((invite) => (
                  <div key={invite.invite_id} className="request-card team-invite-card grid items-center gap-4 px-4 py-2">
                    <div className="request-info min-w-0">
                      <span className="request-username block font-bold">{invite.team_name}</span>
                      <span className="request-message block">{invite.team_about}</span>
                    </div>

                    <div className="request-actions flex items-center gap-3">
                      <button
                        className="btn btn-primary btn-small"
                        onClick={() => acceptTeamInvite(invite.invite_id)}
                      >
                        {t('teams.accept')}
                      </button>

                      <button
                        className="btn btn-danger-actions btn-small"
                        onClick={() => rejectTeamInvite(invite.invite_id)}
                      >
                        {t('teams.reject')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center z-[1000] bg-black/50" onClick={() => setShowCreateModal(false)}>
          <div className="modal w-[70%] max-w-[700px] max-h-[90vh] overflow-y-auto bg-task-gradient border border-border rounded-2xl shadow-task-box-shadow backdrop-blur-[18px]" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex justify-between items-center gap-4 p-4 border-b border-border">
              <h2>{t('teams.createTeam')}</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateTeam} className="p-5 flex flex-col gap-4">
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

              <div className="modal-actions flex justify-end gap-3">
                <button type="button" className="btn btn-danger-actions" onClick={() => setShowCreateModal(false)}>
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
