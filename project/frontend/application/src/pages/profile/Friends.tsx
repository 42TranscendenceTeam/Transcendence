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
import { api } from '../../services/api';
import { getAvatarUrl } from '../../utils/avatar';
import type { Friend } from '../../types';

interface SearchUser {
  id: number;
  username: string;
}

function Friends() {
  const { t } = useTranslation();
  const { user, removeFriend, addFriend, friendRequests, sentRequests, friends, acceptFriendRequest, rejectFriendRequest, fetchFriendRequests, fetchSentRequests, fetchFriends } = useContext(AuthContext);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState<Friend | null>(null);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [manualUsername, setManualUsername] = useState('');
  const [allUsers, setAllUsers] = useState<SearchUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [errorUsers, setErrorUsers] = useState('');
  const [friendSearch, setFriendSearch] = useState('');

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
    setErrorUsers('');
    try {
      const users = await api.searchUsers('');
      setAllUsers(users);
    } catch (err) {
      setErrorUsers('Failed to load users');
      console.error(err);
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
      try {
        await api.removeFriend(friendToRemove.id);
        removeFriend(friendToRemove.id);
        fetchFriends();
      } catch (err) {
        console.error('Failed to remove friend:', err);
      }
      setShowRemoveModal(false);
      setFriendToRemove(null);
    }
  };

  const handleAddFromDropdown = async () => {
    if (!selectedUser) return;
    const userToAdd = availableUsers.find((u) => u.username === selectedUser);
    if (userToAdd) {
      try {
        await api.addFriend(userToAdd.id);
        fetchSentRequests();
        setSelectedUser('');
        setShowAddFriendModal(false);
      } catch (err) {
        const msg = err instanceof Error ? err.message : '';
        setErrorUsers(msg.includes('already exists') ? t('friends.friendRequestExists') : (msg || 'Failed to send friend request'));
        console.error(err);
      }
    }
  };

  const handleAddManual = async () => {
    if (!manualUsername.trim()) return;
    setLoadingUsers(true);
    setErrorUsers('');
    try {
      const users = await api.searchUsers(manualUsername.trim());
      const foundUser = users.find(
        (u) => u.username.toLowerCase() === manualUsername.trim().toLowerCase()
      );
      if (foundUser) {
        await api.addFriend(foundUser.id);
        fetchSentRequests();
        setManualUsername('');
        setShowAddFriendModal(false);
      } else {
        setErrorUsers('User not found');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      setErrorUsers(msg.includes('already exists') ? t('friends.friendRequestExists') : (msg || 'Failed to send friend request'));
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const filteredFriends = friends.filter((friend) =>
    friend.username.toLowerCase().includes(friendSearch.toLowerCase())
  );

  return (
    <div className="friends-page">
      <div className="friends-header">
        <div>
          <h1 className="profile-page-title">{t('friends.title')}</h1>
          <div className="friends-search-wrapper">
            <input
              type="text"
              className="friends-search-input"
              placeholder={t('teams.searchFriends')}
              value={friendSearch}
              onChange={(e) => setFriendSearch(e.target.value)}
            />
          </div>
        </div>

        <button className="btn btn-accent" onClick={() => setShowAddFriendModal(true)}>
          + {t('friends.addFriend')}
        </button>
      </div>

      <div className="profile-section">
        <div className="friends-section-header">
          <div className="friends-section-title">
            <span className="friends-section-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
              </svg>
            </span>
            <h2 className="profile-section-title">{t('friends.myFriends')}</h2>
            <span className="requests-count">{friends.length}</span>
          </div>
        </div>

        {friends.length === 0 ? (
          <div className="empty-state">
            <p>{t('friends.noFriends')}</p>
            <p className="empty-hint">{t('teams.findCollaborators')}</p>
          </div>
        ) : (
          <div className="friends-list">
            {filteredFriends.map((friend) => (
              <div key={friend.id} className="friend-card">
                <button
                  className="friend-card-menu"
                  onClick={() => handleRemoveClick(friend)}
                  aria-label={t('friends.remove')}
                >
                  ×
                </button>

                <img src={friend.avatar} alt={friend.username} className="friend-avatar" />

                <div className="friend-info">
                  <Link to={`/profile/${friend.id}`} className="friend-name">
                    {friend.username}
                  </Link>

                  <span className={`friend-status ${friend.isOnline ? 'online' : 'offline'}`}>
                    {friend.isOnline ? t('common.online') : t('common.offline')}
                  </span>
                </div>

                <Link
                  to={`/profile/friends/${friend.id}`}
                  className="btn btn-secondary btn-small friend-chat-btn"
                >
                  💬 {t('friends.chat')}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pending-requests-section">
        <div className="pending-requests-header">
          <h2 className="section-title">{t('friends.pendingRequests')}</h2>

          <span className="requests-count">
            {sentRequests.length + friendRequests.length}
          </span>
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

                  <div className="request-info">
                    <Link to={`/profile/${request.user.id}`} className="request-username">
                      {request.user.username}
                    </Link>
                    <span className="request-message">
                      {t('teams.wantsToBeFriends')}
                    </span>
                  </div>

                  <div className="request-actions">
                    <button
                      className="btn btn-primary btn-small"
                      onClick={() => acceptFriendRequest(request.request_id)}
                    >
                      {t('friends.accept')}
                    </button>

                    <button
                      className="btn btn-danger-actions btn-small"
                      onClick={() => rejectFriendRequest(request.request_id)}
                    >
                      {t('friends.reject')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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

                  <div className="request-info">
                    <Link to={`/profile/${request.user.id}`} className="request-username">
                      {request.user.username}
                    </Link>
                    <span className="request-message">
                      {t('teams.requestSent')}
                    </span>
                  </div>

                  <div className="request-actions">
                    <span className="request-status">{t('friends.pending')}</span>
                    <button
                      className="friend-card-menu"
                      aria-label={t('friends.remove')}
                    >
                      ×
                    </button>
                  </div>
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

              {errorUsers && <p className="error-text">{errorUsers}</p>}

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
