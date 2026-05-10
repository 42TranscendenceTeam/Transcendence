/**
 * Feed Page Component
 * 
 * Main feed displaying activity and tasks across teams.
 * 
 * TODO: Connect to real API when backend is ready
 */

import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import FeedLayout from '../../components/layouts/FeedLayout';

function RotatingText() {
  const { t } = useTranslation();

  const phrases = [
    t('feed.rotatingPhrase1'),
    t('feed.rotatingPhrase2'),
    t('feed.rotatingPhrase3'),
    t('feed.rotatingPhrase4'),
    t('feed.rotatingPhrase5'),
    t('feed.rotatingPhrase6'),
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [phrases.length]);

  return <span className="rotating-text">{phrases[index]}</span>;
}

function Feed() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  
  const taskItems = [
    {
      id: 1,
      title: 'Build a Task Manager API',
      description: 'Creating a REST API for task management with authentication',
      author: { name: 'Felix', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
      timestamp: '2 hours ago',
      lookingFor: 2,
      tags: ['Backend', 'Node.js', 'API'],
    },
    {
      id: 2,
      title: 'Design System Components',
      description: 'Need help creating reusable UI components for the frontend',
      author: { name: 'Luna', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna' },
      timestamp: '5 hours ago',
      lookingFor: 1,
      tags: ['Frontend', 'React', 'Design'],
    },
    {
      id: 3,
      title: 'Database Schema Refactoring',
      description: 'Looking to optimize our database structure for better performance',
      author: { name: 'Alex', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
      timestamp: '1 day ago',
      lookingFor: 3,
      tags: ['Database', 'PostgreSQL', 'Architecture'],
    },
  ];

  const headerContent = (
    <div className="feed-header">
      {!user && (
        <Link to="/login" className="welcome-user">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="welcome-avatar">
            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.895A15.309 15.309 0 0112 21c-2.17 0-4.207-.316-6.061-1.777a.75.75 0 01-.437-.895z" clipRule="evenodd" />
          </svg>
          <span className="welcome-text">{t('auth.login.title')}</span>
        </Link>
      )}
      <h1 className="feed-title">
        <span className="title-transcendence">Transcendence</span>
      </h1>
      <p className="feed-subtitle">
        <RotatingText />
      </p>
    </div>
  );

  return (
    <FeedLayout header={headerContent}>
      <div className="feed-list">
        {taskItems.map((task) => (
          <div key={task.id} className="task-card">
            <div className="task-header">
              <img src={task.author.avatar} alt={task.author.name} className="task-avatar" />
              <div className="task-user-info">
                <span className="task-author">{task.author.name}</span>
                <span className="task-timestamp">{task.timestamp}</span>
              </div>
            </div>
            <h2 className="task-title">{task.title}</h2>
            <p className="task-description">{task.description}</p>
            <div className="task-tags">
              {task.tags.map((tag) => (
                <span key={tag} className="task-tag">{tag}</span>
              ))}
            </div>
            <div className="task-footer">
              <span className="task-looking">
                {t('feed.lookingFor') || 'Looking for'} <strong>{task.lookingFor}</strong> {task.lookingFor > 1 ? t('feed.collaborators') : t('feed.collaborator')}
              </span>
              <button className="btn btn-primary btn-small">{t('teams.join')}</button>
            </div>
          </div>
        ))}
      </div>
    </FeedLayout>
  );
}

export default Feed;