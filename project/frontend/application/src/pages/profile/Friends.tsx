/**
 * Friends List Page Component
 * 
 * Displays user's friends list.
 * Uses real API for user search.
 */

import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { useError } from '../../context/ErrorContext';
import { api } from '../../services/api';
import { getAvatarUrl } from '../../utils/avatar';
import type { Friend } from '../../types';

interface SearchUser {
  id: number;
  username: string;
}

function Friends() {
  const { t } = useTranslation();
const { showError } = useError();
  const { user, removeFriend, addFriend, friendRequests, sentRequests, friends, acceptFriendRequest, rejectFriendRequest, fetchFriendRequests, fetchSentRequests, fetchFriends, onlineFriendIds } = useContext(AuthContext);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState<Friend | null>(null);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [manualUsername, setManualUsername] = useState('');
  const [allUsers, setAllUsers] = useState<SearchUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    fetchFriendRequests();
    fetchSentRequests();
    fetchFriends();
  }, []);

  useEffect(() => {
    if (showAddFriendModal && allUsers.length === 0) {
      fetchUsers();
    }
  }, [showAddFriendModal]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const users = await api.searchUsers('');
      setAllUsers(users);
    } catch {
      showError(t('common.error'), t('friends.loadUsersFailed'));
    } finally {
      setLoadingUsers(false);
    }
  };

  if (!user) {
    return null;
  }

  const availableUsers = allUsers
    .filter((u) => u.id !== user.id)
    .filter((u) => !friends.some((f) => f.id === u.id))
    .map((u) => ({
      id: u.id,
      username: u.username,
      avatar: getAvatarUrl(u.avatar_url),
      chat: [],
    }));

  const handleRemoveClick = (friend: Friend) => {
    setFriendToRemove(friend);
    setShowRemoveModal(true);
  };

  const handleConfirmRemove = async () => {
    if (friendToRemove) {
      // Pre-check: verify friend still exists in our list
      if (!friends.some(f => f.id === friendToRemove.id)) {
        showError(t('common.error'), t('friends.friendNotFound') || 'This user is no longer in your friends list.');
        setShowRemoveModal(false);
        setFriendToRemove(null);
        return;
      }

      try {
        await api.removeFriend(friendToRemove.id);
        fetchFriends();
      } catch (err: any) {
        showError(t('common.error'), err?.message || t('friends.failedToRemove') || 'Failed to remove friend');
      }
      setShowRemoveModal(false);
      setFriendToRemove(null);
    }
  };

  const handleAddFromDropdown = async () => {
    if (!selectedUser) return;
    const userToAdd = availableUsers.find((u) => u.username === selectedUser);
    if (userToAdd) {
      if (friends.some((f) => f.id === userToAdd.id)) {
        showError(t('common.error'), t('friends.alreadyFriends'));
        return;
      }
      if (sentRequests.some((r) => r.user.id === userToAdd.id)) {
        showError(t('common.error'), t('friends.friendRequestExists'));
        return;
      }
      try {
        await api.addFriend(userToAdd.id);
        fetchSentRequests();
        setSelectedUser('');
        setShowAddFriendModal(false);
      } catch (err) {
        const msg = err instanceof Error ? err.message : '';
        showError(t('common.error'), msg || t('friends.addFriendFailed'));
      }
    }
  };

  const handleAddManual = async () => {
    if (!manualUsername.trim()) return;
    setLoadingUsers(true);
    try {
      const users = await api.searchUsers(manualUsername.trim());
      const foundUser = users.find(
        (u) => u.username.toLowerCase() === manualUsername.trim().toLowerCase()
      );
      if (foundUser) {
        if (friends.some((f) => f.id === foundUser.id)) {
          showError(t('common.error'), t('friends.alreadyFriends'));
          return;
        }
        if (sentRequests.some((r) => r.user.id === foundUser.id)) {
          showError(t('common.error'), t('friends.friendRequestExists'));
          return;
        }
        await api.addFriend(foundUser.id);
        fetchSentRequests();
        setManualUsername('');
        setShowAddFriendModal(false);
      } else {
        showError(t('common.error'), t('friends.userNotFound'));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      showError(t('common.error'), msg || t('friends.addFriendFailed'));
    } finally {
      setLoadingUsers(false);
    }
  };

  return (
    <div className="friends-page">
      <div className="friends-header">
        <h1 className="profile-page-title">{t('friends.title')}</h1>
      </div>

      <div className="profile-section">
        <h2 className="profile-section-title">{t('friends.myFriends')}</h2>
        {friends.length === 0 ? (
          <div className="empty-state">
            <p>{t('friends.noFriends')}</p>
            <p className="empty-hint">{t('teams.findCollaborators')}</p>
          </div>
        ) : (
          <div className="friends-list">
            {friends.map((friend) => (
              <div key={friend.id} className="friend-card">
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img src={friend.avatar} alt={friend.username} className="friend-avatar" />
                  <span className={`status-indicator ${onlineFriendIds.has(friend.id) ? 'online' : 'offline'}`} style={{ position: 'absolute', bottom: 0, right: 0 }} />
                </div>
                <div className="friend-info">
                  <Link to={`/profile/${friend.id}`} className="friend-name">{friend.username}</Link>
                  <span className={`friend-status ${onlineFriendIds.has(friend.id) ? 'online' : 'offline'}`}>
                    {onlineFriendIds.has(friend.id) ? t('common.online') : t('common.offline')}
                  </span>
                </div>
                <Link
                  to={`/profile/friends/${friend.id}`}
                  className="btn btn-secondary btn-small"
                >
                  {t('friends.chat')}
                </Link>
                <button
                  className="btn btn-outline-danger btn-small"
                  onClick={() => handleRemoveClick(friend)}
                >
                  {t('friends.remove')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pending-requests-section">
        <div className="pending-requests-header">
          <h2 className="section-title">{t('friends.pendingRequests')}</h2>
          <button className="btn btn-primary btn-small" onClick={() => setShowAddFriendModal(true)}>
            + {t('friends.addFriend')}
          </button>
        </div>

        <div className="sent-requests-subsection">
          <h3 className="subsection-title">{t('friends.sentRequests')}</h3>
          {sentRequests.length === 0 ? (
            <p className="empty-hint">{t('friends.noSentRequests')}</p>
          ) : (
            <div className="requests-list">
              {sentRequests.map((request) => (
                <div key={request.request_id} className="request-card">
                  <img
                    src={getAvatarUrl(request.user.avatar_url)}
                    alt={request.user.username}
                    className="friend-avatar"
                  />
                  <Link to={`/profile/${request.user.id}`} className="request-username">{request.user.username}</Link>
                  <span className="request-status">{t('friends.pending')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="received-requests-subsection">
          <h3 className="subsection-title">{t('friends.receivedRequests')}</h3>
          {friendRequests.length === 0 ? (
            <p className="empty-hint">{t('friends.noReceivedRequests')}</p>
          ) : (
            <div className="requests-list">
              {friendRequests.map((request) => (
                <div key={request.request_id} className="request-card">
                  <img
                    src={getAvatarUrl(request.user.avatar_url)}
                    alt={request.user.username}
                    className="friend-avatar"
                  />
                  <Link to={`/profile/${request.user.id}`} className="request-username">{request.user.username}</Link>
                  <button
                    className="btn btn-primary btn-small"
                    onClick={() => acceptFriendRequest(request.request_id)}
                  >
                    {t('friends.accept')}
                  </button>
                  <button
                    className="btn btn-outline-danger btn-small"
                    onClick={() => rejectFriendRequest(request.request_id)}
                  >
                    {t('friends.reject')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showRemoveModal && (
        <div className="modal-overlay" onClick={() => setShowRemoveModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('friends.removeFriend') || 'Remove Friend'}</h2>
              <button className="modal-close" onClick={() => setShowRemoveModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p className="remove-member-message">
                {t('friends.confirmRemove') || 'Are you sure you want to remove'} <strong>{friendToRemove?.username}</strong> {t('friends.fromFriends') || 'from your friends'}?
              </p>
              <div className="remove-member-actions">
                <button className="btn btn-secondary" onClick={() => setShowRemoveModal(false)}>{t('common.cancel')}</button>
                <button className="btn btn-danger" onClick={handleConfirmRemove}>{t('friends.remove')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddFriendModal && (
        <div className="modal-overlay" onClick={() => setShowAddFriendModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('friends.addFriend')}</h2>
              <button className="modal-close" onClick={() => setShowAddFriendModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="add-member-method">
                <label className="input-label">{t('friends.selectFromUsers') || 'Select from Users'}</label>
                <div className="add-member-row">
                  {loadingUsers && allUsers.length === 0 ? (
                    <span className="loading-text">Loading users...</span>
                  ) : (
                    <>
                      <select
                        className="input"
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                      >
                        <option value="">{t('teams.selectFriend')}</option>
                        {availableUsers.map((u) => (
                          <option key={u.id} value={u.username}>{u.username}</option>
                        ))}
                      </select>
                      <button className="btn btn-primary" onClick={handleAddFromDropdown}>{t('friends.addFriend')}</button>
                    </>
                  )}
                </div>
              </div>

              <div className="add-member-divider">{t('teams.or')}</div>

              <div className="add-member-method">
                <label className="input-label">{t('teams.addByUsername')}</label>
                <div className="add-member-row">
                  <input
                    type="text"
                    placeholder={t('teams.enterUsername')}
                    className="input"
                    value={manualUsername}
                    onChange={(e) => setManualUsername(e.target.value)}
                  />
                  <button className="btn btn-primary" onClick={handleAddManual} disabled={loadingUsers}>
                    {loadingUsers ? '...' : t('friends.addFriend')}
                  </button>
                </div>
              </div>

              {availableUsers.length === 0 && friends.length > 0 && !loadingUsers && (
                <p className="empty-hint text-center">{t('friends.noUsersToAdd') || 'No users available to add'}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Friends;