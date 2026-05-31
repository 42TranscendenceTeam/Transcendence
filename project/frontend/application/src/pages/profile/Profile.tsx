/**
 * Profile Page Component
 * 
 * Displays user profile information including
 * avatar, username, email, and description.
 */

import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { Team, UserProfileResponse } from '../../services/api';

function Profile() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [profileData, setProfileData] = useState<UserProfileResponse | null>(null);

  useEffect(() => {
    if (!user) return;
    api.getMyTeams().then(setMyTeams).catch(() => setMyTeams([]));
    api.getUserProfile(user.id).then(setProfileData).catch(() => setProfileData(null));
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
    total: myTeams.length,
    active: myTeams.filter((t) => t.status === 'active').length,
    finished: myTeams.filter((t) => t.status === 'finished').length,
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <img src={user.avatar} alt={user.username} className="profile-avatar-large" />
        <h1 className="profile-username">{user.username}</h1>
        <p className="profile-email">{user.email}</p>
        <p className="profile-description">{user.description}</p>
      </div>

      <div className="profile-section">
        <h2 className="profile-section-title">{t('friends.title')}</h2>
        <div className="profile-task-stats">
          <span className="task-count total">{t('tasks.total') || 'Total'}: {user.friends.length}</span>
        </div>
      </div>

      <div className="profile-section">
        <h2 className="profile-section-title">{t('profile.teamStats') || 'Teams Stats'}</h2>
        <div className="profile-task-stats">
          <span className="task-count total">{t('profile.totalTeams') || 'Total'}: {teamStats.total}</span>
          <span className="task-count in_progress">{t('teams.active')}: {teamStats.active}</span>
          <span className="task-count closed">{t('teams.finished')}: {teamStats.finished}</span>
        </div>
      </div>

      <div className="profile-section">
        <h2 className="profile-section-title">{t('profile.taskStats') || 'Task Stats'}</h2>
        <div className="profile-task-stats">
          <span className="task-count total">{t('tasks.total') || 'Total'}: {taskStats.total}</span>
          <span className="task-count open">{t('tasks.open')}: {taskStats.open}</span>
          <span className="task-count in_progress">{t('tasks.inProgress') || 'In Progress'}: {taskStats.in_progress}</span>
          <span className="task-count closed">{t('tasks.done')}: {taskStats.closed}</span>
        </div>
      </div>
    </div>
  );
}

export default Profile;