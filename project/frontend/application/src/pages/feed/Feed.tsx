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
import { getAvatarUrl } from '../../utils/avatar';
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
    owner: { id: 1, username: 'Felix', avatar: '/api/public/avatars/default.png' },
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
    owner: { id: 2, username: 'Luna', avatar: '/api/public/avatars/default.png' },
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
    owner: { id: 3, username: 'Alex', avatar: '/api/public/avatars/default.png' },
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
    owner: { id: 4, username: 'Sam', avatar: '/api/public/avatars/default.png' },
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
  const [requestStatuses, setRequestStatuses] = useState<Record<number, 'pending' | 'rejected'>>(() => {
    try {
      const saved = localStorage.getItem('joinRequestStatuses');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('joinRequestStatuses', JSON.stringify(requestStatuses));
  }, [requestStatuses]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const teamsData = await api.getTeams();

        let baseTeams: Team[];

        if (user) {
          const myTeams = await api.getMyTeams();
          const myTeamIds = new Set(myTeams.map(t => t.id));

          setRequestStatuses(prev => {
            const next = { ...prev };
            let changed = false;
            const pendingIds = Object.keys(next).filter(k => next[Number(k)] === 'pending').map(Number);
            for (const teamId of pendingIds) {
              if (myTeamIds.has(teamId)) {
                delete next[teamId];
                changed = true;
              }
            }
            return changed ? next : prev;
          });

          baseTeams = teamsData.filter(t => !myTeamIds.has(t.id));

          const rawPendingIds = Object.keys(requestStatuses)
            .filter(k => requestStatuses[Number(k)] === 'pending')
            .map(Number);
          const pendingIds = rawPendingIds.filter(id => !myTeamIds.has(id));
          if (pendingIds.length > 0) {
            const results = await Promise.all(
              pendingIds.map(async (teamId) => {
                try {
                  const data = await api.getJoinRequests(teamId);
                  const hasPending = data.request_list.some(r => r.user_id === user.id);
                  return { teamId, valid: hasPending };
                } catch {
                  return { teamId, valid: false };
                }
              })
            );
            setRequestStatuses(prev => {
              const next = { ...prev };
              let changed = false;
              for (const { teamId, valid } of results) {
                if (!valid && next[teamId] === 'pending') {
                  delete next[teamId];
                  changed = true;
                }
              }
              return changed ? next : prev;
            });
          }
        } else {
          baseTeams = teamsData;
        }

        const statusResults = await Promise.all(
          baseTeams.map(async (team) => {
            try {
              const detail = await api.getTeam(team.id);
              return { id: team.id, isFinished: detail.status === 'finished' };
            } catch {
              return { id: team.id, isFinished: false };
            }
          })
        );
        const finishedIds = new Set(
          statusResults.filter(r => r.isFinished).map(r => r.id)
        );
        if (finishedIds.size > 0) {
          baseTeams = baseTeams.filter(t => !finishedIds.has(t.id));
        }

        setTeams(baseTeams);
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

  const availableTeams = teams.filter(t =>
    (t.memberCount || 0) < (t.maxUsers || 10) &&
    t.status !== 'finished'
  );

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
      setRequestStatuses(prev => ({ ...prev, [teamId]: 'pending' }));
      setNotificationType('success');
      setNotificationMessage(t('teams.joinRequestSent') || `Join request sent for "${teamName}"!`);
      setShowNotification(true);
    } catch (err: any) {
      const message = err?.message || '';
      if (message.includes('already exists')) {
        setRequestStatuses(prev => ({ ...prev, [teamId]: 'pending' }));
        setNotificationType('info');
        setNotificationMessage(t('teams.alreadyRequested') || 'You already have a pending request for this team.');
      } else {
        setNotificationType('error');
        setNotificationMessage(t('teams.joinRequestFailed') || 'Failed to send join request.');
      }
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
        <span>Activity Feed</span>
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
                src={getAvatarUrl(team.owner.avatar)}
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
              <button
                className={`btn btn-small ${requestStatuses[team.id] === 'pending' && user ? 'btn-pending' : 'btn-primary'}`}
                onClick={() => handleJoinTeam(team.id, team.name)}
                disabled={requestStatuses[team.id] === 'pending' && !!user}
              >
                {requestStatuses[team.id] === 'pending' && user ? t('teams.pending') : t('teams.join')}
              </button>
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
