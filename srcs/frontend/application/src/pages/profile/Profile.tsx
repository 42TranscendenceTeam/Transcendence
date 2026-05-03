import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

function Profile() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return null;
  }

  const allTasks = user.teams.flatMap((team) =>
    team.tasks
      .filter((task) => task.assignedTo?.id === user.id)
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
        <h2 className="profile-section-title">Colaboration</h2>
        <div className="profile-stats">
          <div className="profile-stat">
            <span className="stat-value">{user.friends.length}</span>
            <span className="stat-label">Friends</span>
          </div>
          <div className="profile-stat">
            <span className="stat-value">{user.teams.length}</span>
            <span className="stat-label">Teams</span>
          </div>
        </div>
      </div>

      <div className="profile-section">
        <h2 className="profile-section-title">Task Stats</h2>
        <div className="profile-task-stats">
          <span className="task-count total">Total: {taskStats.total}</span>
          <span className="task-count to_do">To Do: {taskStats.to_do}</span>
          <span className="task-count in_progress">In Progress: {taskStats.in_progress}</span>
          <span className="task-count done">Done: {taskStats.done}</span>
        </div>
      </div>
    </div>
  );
}

export default Profile;