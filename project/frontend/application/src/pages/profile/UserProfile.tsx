import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!userId) return;
    api.getUserProfile(Number(userId))
      .then(setProfile)
      .catch((err) => setError(err.message));
  }, [userId]);

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
        <img src={getAvatarUrl(profile.avatar_url)} alt={profile.username} className="profile-avatar-large" />
        <h1 className="profile-username">{profile.username}</h1>
        <p className="profile-email">{profile.email}</p>
        {profile.bio && <p className="profile-description">{profile.bio}</p>}
      </div>

      <div className="profile-section">
        <h2 className="profile-section-title">{t('friends.title')}</h2>
        <div className="profile-task-stats">
          <span className="task-count total">{t('tasks.total') || 'Total'}: {profile.friendCount}</span>
        </div>
      </div>

      <div className="profile-section">
        <h2 className="profile-section-title">{t('profile.teamStats') || 'Teams Stats'}</h2>
        <div className="profile-task-stats">
          <span className="task-count total">{t('profile.totalTeams') || 'Total'}: {profile.teamCount}</span>
          <span className="task-count in_progress">{t('teams.active')}: {profile.activeTeams}</span>
          <span className="task-count done">{t('teams.finished')}: {profile.finishedTeams}</span>
        </div>
      </div>

      <div className="profile-section">
        <h2 className="profile-section-title">{t('profile.taskStats') || 'Task Stats'}</h2>
        <div className="profile-task-stats">
          <span className="task-count total">{t('tasks.total') || 'Total'}: {profile.taskCount}</span>
          <span className="task-count to_do">{t('tasks.open')}: {profile.tasksToDo}</span>
          <span className="task-count in_progress">{t('tasks.inProgress') || 'In Progress'}: {profile.tasksInProgress}</span>
          <span className="task-count done">{t('tasks.done')}: {profile.tasksDone}</span>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
