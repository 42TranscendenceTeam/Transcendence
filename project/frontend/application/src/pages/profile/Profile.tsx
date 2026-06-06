/**
 * Profile Page Component
 *
 * Displays user profile information including
 * avatar, username, email, and description.
 */

import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { api, Team } from '../../services/api';

function Profile() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const [teams, setTeams] = useState<Team[]>([]);
  const [profileData, setProfileData] = useState<UserProfileResponse | null>(null);

  useEffect(() => {
    if (!user) return;

    api.getMyTeams()
      .then(setTeams)
      .catch(() => setTeams([]));

    api.getUserProfile(user.id)
      .then(setProfileData)
      .catch(() => setProfileData(null));
  }, [user]);

  if (!user) {
    return null;
  }

  const taskStats = profileData
    ? {
      total: profileData.taskCount,
      open: profileData.tasksToDo,
      in_progress: profileData.tasksInProgress,
      closed: profileData.tasksDone,
    }
    : { total: 0, open: 0, in_progress: 0, closed: 0 };

  const teamStats = {
    total: teams.length,
    active: teams.filter((t) => t.status === 'active').length,
    finished: teams.filter((t) => t.status === 'finished').length,
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-header-main">
          <img src={user.avatar} alt={user.username} className="profile-avatar-large" />

          <div className="profile-header-info">
            <h1 className="profile-username">{user.username}</h1>
            <p className="profile-email">{user.email}</p>
            <p className="profile-description">{user.description}</p>
          </div>
        </div>

        <Link to="/profile/edit" className="btn btn-accent profile-edit-btn">
          {t('profile.edit.title') || 'Edit profile'}
        </Link>
      </div>

      <div className="profile-stats-grid">
        <div className="profile-stat-card">
          <div className="profile-stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>

          <div className="profile-stat-info">
            <span className="profile-stat-value">{user.friends.length}</span>
            <span className="profile-stat-label">{t('friends.title')}</span>
          </div>
        </div>

        <div className="profile-stat-card">
          <div className="profile-stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zm0 7.8L6.2 7 12 4.2 17.8 7 12 9.8zM2 12l10 5 10-5-2.2-1.1L12 14.8 4.2 10.9 2 12zm0 5l10 5 10-5-2.2-1.1L12 19.8 4.2 15.9 2 17z" />
            </svg>
          </div>

          <div className="profile-stat-info">
            <span className="profile-stat-value">{teamStats.total}</span>
            <span className="profile-stat-label">{t('teams.title')}</span>

            <div className="profile-stat-subtext">
              <span className="task-count in_progress">
                {t('teams.active')}: {teamStats.active}
              </span>
              <span className="task-count closed">
                {t('teams.finished')}: {teamStats.finished}
              </span>
            </div>
          </div>
        </div>

        <div className="profile-stat-card">
          <div className="profile-stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 4h10a2 2 0 012 2v14l-3-2-3 2-3-2-3 2-3-2V6a2 2 0 012-2zm2 5h6V7H9v2zm0 4h6v-2H9v2zm0 4h4v-2H9v2z" />
            </svg>
          </div>

          <div className="profile-stat-info">
            <span className="profile-stat-value">{taskStats.total}</span>
            <span className="profile-stat-label">{t('profile.taskStats') || 'Task Stats'}</span>

            <div className="profile-stat-subtext">
              <span className="task-count open">
                {t('tasks.open')}: {taskStats.open}
              </span>
              <span className="task-count in_progress">
                {t('tasks.inProgress') || 'In Progress'}: {taskStats.in_progress}
              </span>
              <span className="task-count closed">
                {t('tasks.done')}: {taskStats.closed}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-section profile-teams-section">
        <div className="profile-section-header">
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
              <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
            </svg>
          </span>
          <h2 className="profile-section-title">{t('teams.myTeams') || 'My Teams'}</h2>
        </div>

        <div className="teams-list">
          {teams.slice(0, 4).map((team) => (
            <Link key={team.id} to={`/teams/${team.id}`} className="team-card">
              <div className="team-info">
                <span className="team-name">{team.name}</span>
                <span className="team-description">
                  {team.objective || 'No description added yet.'}
                </span>
              </div>

              <div className="team-meta">
                <div className="team-meta-item">
                  <span className="team-meta-label">{t('teams.role')}</span>
                  <span className={`team-role inline-center ${team.role?.toLowerCase()}`}> {team.role}
                    {team.role?.toLowerCase() === 'leader' && (
                      <span className="team-role-crown" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 12 12 6l4.5 6 4.5-4.5L19.5 18h-15L3 7.5Z" />
                        </svg>
                      </span>
                    )}
                  </span>
                </div>

                <div className="team-meta-item">
                  <span className="team-meta-label">{t('teams.status')}</span>
                  <span className={`team-status ${team.status}`}>
                    {team.status === 'active'
                      ? t('teams.active')
                      : team.status === 'finished'
                        ? t('teams.finished')
                        : team.status}
                  </span>
                </div>

                <div className="team-meta-item">
                  <span className="team-meta-label">{t('teams.members')}</span>
                  <span className="team-meta-value">
                    <span className="team-meta-icon" aria-hidden="true">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
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
                  <span className="team-meta-label">{t('teams.created')}</span>
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
      </div>
    </div>
  );
}

export default Profile;
