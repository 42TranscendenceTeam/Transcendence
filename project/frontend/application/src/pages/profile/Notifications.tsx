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

  const unreadFriendNotifications = friendNotifications.filter(
    (notification) => !notification.status_read
  ).length;

  const unreadTeamNotifications = teamNotifications.filter(
    (notification) => !notification.status_read
  ).length;

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <h1 className="profile-page-title">{t('notifications.title')}</h1>
          <p className="profile-page-subtitle">
            {t('notifications.subtitle')}
          </p>
        </div>

        <button className="btn btn-danger-actions" onClick={deleteAllNotifications}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '0.875rem', height: '0.875rem' }}>
            <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" />
          </svg>

          {t('notifications.deleteAll')}
        </button>
      </div>

      <div className="notifications-section">
        <h2 className="notifications-section-title">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18" style={{ marginRight: '0.4rem' }}>
            <path d={FRIEND_ICON} />
          </svg>
          {t('notifications.friendNotifications')}
          {unreadFriendNotifications > 0 && (
            <span className="notifications-section-count">
              {unreadFriendNotifications}
            </span>
          )}
        </h2>
        {friendNotifications.length === 0 ? (
          <p className="empty-hint">{t('notifications.noFriendNotifications')}</p>
        ) : (
          <div className="notifications-list">
            {friendNotifications.map((notification) => (
              <Link
                key={notification.id}
                to="/profile/friends"
                className={`notification-item${!notification.status_read ? ' unread' : ''}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="notification-item-content">
                  <span className="notification-item-text">
                    {getNotificationText(notification.type, notification.content, t)}
                  </span>

                  <span className="notification-item-time">
                    {getRelativeTime(notification.created_at, t)}
                  </span>
                </div>

                <button
                  className="btn btn-danger-actions btn-small"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
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
          {unreadTeamNotifications > 0 && (
            <span className="notifications-section-count">
              {unreadTeamNotifications}
            </span>
          )}
        </h2>
        {teamNotifications.length === 0 ? (
          <p className="empty-hint">{t('notifications.noTeamNotifications')}</p>
        ) : (
          <div className="notifications-list">
            {teamNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item${!notification.status_read ? ' unread' : ''}`}
                onClick={() => handleTeamNotificationClick(notification)}
              >
                <div className="notification-item-content">
                  <span className="notification-item-text">
                    {getNotificationText(notification.type, notification.content, t)}
                  </span>
                  <span className="notification-item-time">
                    {getRelativeTime(notification.created_at, t)}
                  </span>
                </div>

                <button
                  className="btn btn-danger-actions btn-small"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
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
