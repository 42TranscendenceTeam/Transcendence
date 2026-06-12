import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api';
import type { UserProfileResponse } from '../../services/api';
import { getAvatarUrl } from '../../utils/avatar';

function UserProfile() {
  const { t } = useTranslation();
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);

  const fetchProfile = useCallback(() => {
    if (!userId) return;
    api.getUserProfile(Number(userId))
      .then(setProfile)
      .catch((err) => setError(err.message));
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (!userId) return;
    api.getUserOnline(Number(userId))
      .then((data) => setIsOnline(data.Online))
      .catch(() => { });
    const poll = setInterval(() => {
      api.getUserOnline(Number(userId))
        .then((data) => setIsOnline(data.Online))
        .catch(() => { });
    }, 5000);
    return () => clearInterval(poll);
  }, [userId]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchProfile();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [fetchProfile]);

  if (error) {
    return (
      <div className="profile-page">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-header-main">
          <img
            src={getAvatarUrl(profile.avatar_url)}
            alt={profile.username}
            className="profile-avatar-large"
          />

          <div className="profile-header-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 className="profile-username">{profile.username}</h1>
              <span className={`friend-status ${isOnline ? 'online' : 'offline'}`}>
                {isOnline ? t('common.online') : t('common.offline')}
              </span>
            </div>

            <p className="profile-email">{profile.email}</p>
            {profile.bio && <p className="profile-description">{profile.bio}</p>}
          </div>
        </div>
      </div>

      <div className="profile-stats-grid">
        <div className="profile-stat-card">
          <div className="profile-stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>

          <div className="profile-stat-info">
            <span className="profile-stat-value">{profile.friendCount}</span>
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
            <span className="profile-stat-value">{profile.teamCount}</span>
            <span className="profile-stat-label">{t('teams.title')}</span>

            <div className="profile-stat-subtext">
              <span className="task-count in_progress">
                {t('teams.active')}: {profile.activeTeams}
              </span>
              <span className="task-count closed">
                {t('teams.finished')}: {profile.finishedTeams}
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
            <span className="profile-stat-value">{profile.taskCount}</span>
            <span className="profile-stat-label">{t('profile.taskStats') || 'Task Stats'}</span>

            <div className="profile-stat-subtext">
              <span className="task-count open">
                {t('tasks.open')}: {profile.tasksToDo}
              </span>
              <span className="task-count in_progress">
                {t('tasks.inProgress') || 'In Progress'}: {profile.tasksInProgress}
              </span>
              <span className="task-count closed">
                {t('tasks.done')}: {profile.tasksDone}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}

export default UserProfile;
