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
import type { Team } from '../../services/api';

function Profile() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const [myTeams, setMyTeams] = useState<Team[]>([]);

  useEffect(() => {
    api.getMyTeams().then(setMyTeams).catch(() => setMyTeams([]));
  }, []);

  if (!user) {
    return null;
  }

  const allTasks = (user.teams || []).flatMap((team) =>
    (team.tasks || []).filter((task) => task.assignedTo?.id === user.id)
      .map((task) => ({ ...task, teamName: team.name }))
  );

  const taskStats = {
    total: allTasks.length,
    open: allTasks.filter((t) => t.status === 'open').length,
    in_progress: allTasks.filter((t) => t.status === 'in_progress').length,
    closed: allTasks.filter((t) => t.status === 'closed').length,
  };

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