/**
 * Notifications Page Component
 *
 * Displays a summary of pending notifications.
 */

import { useContext, useEffect } from 'react';
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

  const pendingTeamInvites = teamInvites;
  const pendingFriendInvites = friendRequests.filter((r) => r.status === 'pending');

  return (
    <div className="notifications-page">
      <h1 className="profile-page-title">{t('notifications.title')}</h1>

      <div className="profile-section">
        <h2 className="profile-section-title">{t('notifications.teamInvites')}</h2>
        {pendingTeamInvites.length === 0 ? (
          <p className="empty-hint">{t('notifications.noTeamInvites')}</p>
        ) : (
          <div className="notification-summary-item">
            <span className="notification-summary-label">{t('notifications.pendingTeamInvites')}</span>
            <span className="notification-summary-value">{pendingTeamInvites.length}</span>
          </div>
        )}
      </div>

      <div className="profile-section">
        <h2 className="profile-section-title">{t('notifications.friendInvites')}</h2>
        {pendingFriendInvites.length === 0 ? (
          <p className="empty-hint">{t('notifications.noFriendInvites')}</p>
        ) : (
          <div className="notification-summary-item">
            <span className="notification-summary-label">{t('notifications.pendingFriendInvites')}</span>
            <span className="notification-summary-value">{pendingFriendInvites.length}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;