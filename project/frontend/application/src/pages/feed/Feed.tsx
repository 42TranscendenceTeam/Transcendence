/**
 * Feed Page Component
 *
 * Main feed displaying available teams that need members.
 */

import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { api, Team } from '../../services/api';
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

const MOCK_AVAILABLE_TEAMS: Team[] = [
  {
    id: 1,
    name: 'Mobile App Project',
    objective: 'Building a cross-platform mobile application for campus events',
    owner: { id: 1, username: 'Felix', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
    role: 'Leader',
    status: 'active',
    members: [],
    tags: ['Frontend', 'Mobile', 'UI/UX'],
    maxUsers: 5,
    memberCount: 3,
    isMember: false,
    created_at: '2024-01-15',
  },
  {
    id: 2,
    name: 'AI Chatbot',
    objective: 'Creating an AI-powered chatbot for student support',
    owner: { id: 2, username: 'Luna', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna' },
    role: 'Leader',
    status: 'active',
    members: [],
    tags: ['Backend', 'AI', 'API'],
    maxUsers: 4,
    memberCount: 2,
    isMember: false,
    created_at: '2024-01-20',
  },
  {
    id: 3,
    name: 'E-commerce Platform',
    objective: 'Developing a full-stack e-commerce solution for local vendors',
    owner: { id: 3, username: 'Alex', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
    role: 'Leader',
    status: 'active',
    members: [],
    tags: ['Frontend', 'Backend', 'DB'],
    maxUsers: 6,
    memberCount: 4,
    isMember: false,
    created_at: '2024-01-25',
  },
  {
    id: 4,
    name: 'Data Analytics Dashboard',
    objective: 'Building a real-time analytics dashboard for university metrics',
    owner: { id: 4, username: 'Sam', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam' },
    role: 'Leader',
    status: 'active',
    members: [],
    tags: ['Data', 'Frontend', 'Visualization'],
    maxUsers: 3,
    memberCount: 1,
    isMember: false,
    created_at: '2024-02-01',
  },
];

function Feed() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'success' | 'error' | 'info'>('success');
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const teamsData = await api.getTeams();
        setTeams(teamsData);
        setIsUsingMockData(false);
      } catch (err) {
        console.error('Failed to fetch teams:', err);
        if (!user) {
          setTeams(MOCK_AVAILABLE_TEAMS);
          setIsUsingMockData(true);
        } else {
          setError('Failed to load teams');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, [user]);

  const availableTeams = user
    ? teams.filter(t => !t.isMember && (t.memberCount || 0) < (t.maxUsers || 10))
    : teams.filter(t => (t.memberCount || 0) < (t.maxUsers || 10));

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleJoinTeam = async (teamId: number, teamName: string) => {
    if (!user) {
      setNotificationType('info');
      setNotificationMessage(t('teams.loginRequired') || 'Please log in to join a team');
      setShowNotification(true);
      return;
    }
    try {
      await api.sendJoinRequest(teamId);
      setNotificationType('success');
      setNotificationMessage(t('teams.joinRequestSent') || `Join request sent for "${teamName}"!`);
      setShowNotification(true);
    } catch (err) {
      console.error('Failed to send join request:', err);
      setNotificationType('error');
      setNotificationMessage(t('teams.joinRequestFailed') || 'Failed to send join request. You may have already requested to join this team.');
      setShowNotification(true);
    }
  };

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
        {loading && <div className="loading">Loading teams...</div>}
        {error && !isUsingMockData && <div className="error-text">{error}</div>}
        {isUsingMockData && !user && (
          <p className="empty-hint" style={{ textAlign: 'center', marginBottom: '1rem' }}>
            Sign in to see real team data
          </p>
        )}
        {!loading && !error && availableTeams.length === 0 && (
          <div className="empty-state">
            <p>No teams available to join right now.</p>
            <p className="empty-hint">Check back later!</p>
          </div>
        )}
        {!loading && !error && availableTeams.map((team) => (
          <div key={team.id} className="task-card">
            <div className="task-header">
              <img
                src={team.owner.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${team.owner.username}`}
                alt={team.owner.username}
                className="task-avatar"
              />
              <div className="task-user-info">
                <span className="task-author">{team.owner.username}</span>
                <span className="task-timestamp">{formatDate(team.created_at)}</span>
              </div>
            </div>
            <h2 className="task-title">{team.name}</h2>
            <p className="task-description">{team.objective}</p>
            <div className="task-tags">
              {(team.tags || []).map((tag) => (
                <span key={tag} className="task-tag">{tag}</span>
              ))}
            </div>
            <div className="task-footer">
              <span className="task-looking">
                {t('feed.lookingFor') || 'Looking for'} <strong>{(team.maxUsers || 10) - (team.memberCount || 0)}</strong> {(team.maxUsers || 10) - (team.memberCount || 0) > 1 ? t('feed.collaborators') : t('feed.collaborator')}
              </span>
              <button className="btn btn-primary btn-small" onClick={() => handleJoinTeam(team.id, team.name)}>{t('teams.join')}</button>
            </div>
          </div>
        ))}
      </div>

      {showNotification && (
        <div className="modal-overlay" onClick={() => setShowNotification(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {notificationType === 'success' && (t('common.success') || 'Success')}
                {notificationType === 'error' && (t('common.error') || 'Error')}
                {notificationType === 'info' && (t('common.info') || 'Info')}
              </h2>
              <button className="modal-close" onClick={() => setShowNotification(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className={notificationType === 'success' ? 'success-content' : notificationType === 'error' ? 'error-content' : 'info-content'}>
                <p className={notificationType === 'success' ? 'success-message' : notificationType === 'error' ? 'error-message' : 'info-message'}>
                  {notificationMessage}
                </p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => setShowNotification(false)}>
                {t('common.close') || 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </FeedLayout>
  );
}

export default Feed;