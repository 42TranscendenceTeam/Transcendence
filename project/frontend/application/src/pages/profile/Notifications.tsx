/**
 * Notifications Page Component
 *
 * Displays pending notifications as clickable cards.
 */

import { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';

function Notifications() {
  const { t } = useTranslation();
  const { friendRequests, teamInvites, fetchFriendRequests, fetchTeamInvites, markNotificationsRead } = useContext(AuthContext);

  useEffect(() => {
    fetchFriendRequests();
    fetchTeamInvites();
    markNotificationsRead();
  }, []);

  const pendingTeamInvites = teamInvites.length;
  const pendingFriendInvites = friendRequests.filter((r) => r.status === 'pending').length;

  return (
    <div className="notifications-page">
      <h1 className="profile-page-title">{t('notifications.title')}</h1>

      <Link to="/profile/teams" className="notification-card">
        <div className="notification-card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
        </div>
        <div className="notification-card-info">
          <span className="notification-card-title">{t('notifications.teamInvitesCard')}</span>
          <span className="notification-card-desc">{t('notifications.teamInvitesDesc')}</span>
        </div>
        {pendingTeamInvites > 0 && (
          <span className="notification-card-badge">{pendingTeamInvites}</span>
        )}
        <div className="notification-card-arrow">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
          </svg>
        </div>
      </Link>

      <Link to="/profile/friends" className="notification-card">
        <div className="notification-card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
          </svg>
        </div>
        <div className="notification-card-info">
          <span className="notification-card-title">{t('notifications.friendInvitesCard')}</span>
          <span className="notification-card-desc">{t('notifications.friendInvitesDesc')}</span>
        </div>
        {pendingFriendInvites > 0 && (
          <span className="notification-card-badge">{pendingFriendInvites}</span>
        )}
        <div className="notification-card-arrow">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
          </svg>
        </div>
      </Link>
    </div>
  );
}

export default Notifications;