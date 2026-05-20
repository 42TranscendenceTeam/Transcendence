/**
 * Profile Page Component
 * 
 * Displays user profile information including
 * avatar, username, email, and description.
 */

import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';

function Profile() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);

  if (!user) {
    return null;
  }

  const allTasks = (user.teams || []).flatMap((team) =>
    (team.tasks || []).filter((task) => task.assignedTo?.id === user.id)
      .map((task) => ({ ...task, teamName: team.name }))
  );

  const taskStats = {
    total: allTasks.length,
    to_do: allTasks.filter((t) => t.status === 'to_do').length,
    in_progress: allTasks.filter((t) => t.status === 'in_progress').length,
    done: allTasks.filter((t) => t.status === 'done').length,
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
        <h2 className="profile-section-title">{t('profile.collaboration') || 'Collaboration'}</h2>
        <div className="profile-stats">
          <div className="profile-stat">
            <span className="stat-value">{user.friends.length}</span>
            <span className="stat-label">{t('friends.title')}</span>
          </div>
          <div className="profile-stat">
            <span className="stat-value">{user.teams.length}</span>
            <span className="stat-label">{t('teams.title')}</span>
          </div>
        </div>
      </div>

      <div className="profile-section">
        <h2 className="profile-section-title">{t('profile.taskStats') || 'Task Stats'}</h2>
        <div className="profile-task-stats">
          <span className="task-count total">{t('tasks.total') || 'Total'}: {taskStats.total}</span>
          <span className="task-count to_do">{t('tasks.open')}: {taskStats.to_do}</span>
          <span className="task-count in_progress">{t('tasks.inProgress') || 'In Progress'}: {taskStats.in_progress}</span>
          <span className="task-count done">{t('tasks.done')}: {taskStats.done}</span>
        </div>
      </div>
    </div>
  );
}

export default Profile;