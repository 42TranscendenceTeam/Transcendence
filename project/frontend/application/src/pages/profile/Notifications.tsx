import { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { useError } from '../../context/ErrorContext';
import { api } from '../../services/api';
import type { AppNotification } from '../../types';

const FRIEND_ICON = 'M12 11c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm-6 8c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z';
const TEAM_ICON = 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5';

function getRelativeTime(createdAt: string, t: (key: string, options?: Record<string, unknown>) => string): string {
  const now = Date.now();
  const then = new Date(createdAt).getTime();
  const diffMs = now - then;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return t('notifications.justNow');
  if (diffMinutes < 60) return t('notifications.minutesAgo', { minutes: diffMinutes });
  if (diffHours < 24) return t('notifications.hoursAgo', { hours: diffHours });
  return t('notifications.daysAgo', { days: diffDays });
}

const NOTIFICATION_PATTERNS: Record<string, { regex: RegExp; vars: string[]; key: string }> = {
  friend_request: {
    regex: /^You got a friend request from (.+?)\.$/,
    vars: ['username'],
    key: 'friendRequest',
  },
  friend_request_accepted: {
    regex: /^(.+?) accepted your friend request\.$/,
    vars: ['username'],
    key: 'friendRequestAccepted',
  },
  friend_request_rejected: {
    regex: /^(.+?) rejected your friend request\.$/,
    vars: ['username'],
    key: 'friendRequestRejected',
  },
  friend_removed: {
    regex: /^(.+?) removed you from their friends\.$/,
    vars: ['username'],
    key: 'friendRemoved',
  },
  team_join_request: {
    regex: /^(.+?) requested to join (.+?)\.$/,
    vars: ['username', 'team'],
    key: 'teamJoinRequest',
  },
  team_join_request_accepted: {
    regex: /^You were accepted to join the (.+?) team\.$/,
    vars: ['team'],
    key: 'teamJoinRequestAccepted',
  },
  team_join_request_rejected: {
    regex: /^Your request to join (.+?) was rejected\.$/,
    vars: ['team'],
    key: 'teamJoinRequestRejected',
  },
  team_invite: {
    regex: /^(.+?) invited you to join their (.+?) team\.$/,
    vars: ['owner', 'team'],
    key: 'teamInviteReceived',
  },
  team_invite_accepted: {
    regex: /^(.+?) accepted to join the (.+?) team\.$/,
    vars: ['username', 'team'],
    key: 'teamInviteAccepted',
  },
  team_invite_rejected: {
    regex: /^(.+?) declined your invite to join (.+?)\.$/,
    vars: ['username', 'team'],
    key: 'teamInviteRejected',
  },
  team_removed: {
    regex: /^You were removed from the (.+?) team\.$/,
    vars: ['team'],
    key: 'teamRemoved',
  },
  team_user_left: {
    regex: /^(.+?) left (.+?)\.$/,
    vars: ['username', 'team'],
    key: 'teamUserLeft',
  },
  team_deleted: {
    regex: /^The (.+?) team has been deleted by its owner\.$/,
    vars: ['team'],
    key: 'teamDeleted',
  },
};

function extractTeamName(type: string, content: string | null): string | null {
  if (!content) return null;
  const pattern = NOTIFICATION_PATTERNS[type];
  if (!pattern) return null;
  const match = content.match(pattern.regex);
  if (!match) return null;
  const teamIndex = pattern.vars.indexOf('team');
  if (teamIndex === -1) return null;
  return match[teamIndex + 1];
}

function getNotificationText(
  type: string,
  content: string | null,
  t: (key: string, options?: Record<string, unknown>) => string,
): string {
  if (!content) return '';

  const pattern = NOTIFICATION_PATTERNS[type];
  if (!pattern) return content;

  const match = content.match(pattern.regex);
  if (!match) return content;

  const vars: Record<string, string> = {};
  pattern.vars.forEach((name, i) => {
    vars[name] = match[i + 1];
  });

  return t(`notifications.${pattern.key}`, vars);
}

function isFriendType(type: string): boolean {
  return type.startsWith('friend_');
}

function isTeamType(type: string): boolean {
  return type.startsWith('team_');
}

function Notifications() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showError } = useError();
  const { user, notifications, fetchNotifications, deleteAllNotifications, deleteNotification, markAsRead } = useContext(AuthContext);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleTeamNotificationClick = async (notification: AppNotification) => {
    const teamName = extractTeamName(notification.type, notification.content);
    if (teamName) {
      try {
        const teamsData = await api.getTeams();
        const foundTeam = teamsData.find(t => t.name === teamName);
        
        if (foundTeam) {
          // Check if user is already a member using api.getMyTeams for authoritative list
          const myTeams = await api.getMyTeams();
          const isMember = myTeams.some(mt => mt.id === foundTeam.id);
          
          if (isMember) {
            navigate(`/teams/${foundTeam.id}`);
          } else {
            // Not a member yet, redirect to team list
            navigate('/profile/teams');
          }
        } else {
          navigate('/profile/teams');
        }
      } catch (err) {
        console.error('Notification navigation failed:', err);
        navigate('/profile/teams');
      }
    } else {
      navigate('/profile/teams');
    }
    markAsRead(notification.id);
  };

  const friendNotifications = notifications.filter((n) => isFriendType(n.type));
  const teamNotifications = notifications.filter((n) => isTeamType(n.type));

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1 className="profile-page-title">{t('notifications.title')}</h1>
        <button className="btn btn-outline-danger btn-small" onClick={deleteAllNotifications}>
          {t('notifications.deleteAll')}
        </button>
      </div>

      <div className="notifications-section">
        <h2 className="notifications-section-title">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18" style={{ marginRight: '0.4rem' }}>
            <path d={FRIEND_ICON} />
          </svg>
          {t('notifications.friendNotifications')}
        </h2>
        {friendNotifications.length === 0 ? (
          <p className="empty-hint">{t('notifications.noFriendNotifications')}</p>
        ) : (
          <div className="notifications-list">
            {friendNotifications.map((notification) => (
              <Link
                key={notification.id}
                to="/profile/friends"
                className={'team-card' + (!notification.status_read ? ' notification-unread' : '')}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="team-info">
                  <span className="team-name">{getNotificationText(notification.type, notification.content, t)}</span>
                  <span className="team-role">{getRelativeTime(notification.created_at, t)}</span>
                </div>
                <button
                  className="btn btn-outline-danger btn-small"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteNotification(notification.id); }}
                >
                  {t('notifications.delete')}
                </button>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="notifications-section">
        <h2 className="notifications-section-title">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18" style={{ marginRight: '0.4rem' }}>
            <path d={TEAM_ICON} />
          </svg>
          {t('notifications.teamNotifications')}
        </h2>
        {teamNotifications.length === 0 ? (
          <p className="empty-hint">{t('notifications.noTeamNotifications')}</p>
        ) : (
          <div className="notifications-list">
            {teamNotifications.map((notification) => (
              <div
                key={notification.id}
                className={'team-card' + (!notification.status_read ? ' notification-unread' : '')}
                style={{ cursor: 'pointer' }}
                onClick={() => handleTeamNotificationClick(notification)}
              >
                <div className="team-info">
                  <span className="team-name">{getNotificationText(notification.type, notification.content, t)}</span>
                  <span className="team-role">{getRelativeTime(notification.created_at, t)}</span>
                </div>
                <button
                  className="btn btn-outline-danger btn-small"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteNotification(notification.id); }}
                >
                  {t('notifications.delete')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
