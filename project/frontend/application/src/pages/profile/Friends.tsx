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
  const { user, removeFriend, addFriend, friendRequests, sentRequests, friends, acceptFriendRequest, rejectFriendRequest, fetchFriendRequests, fetchSentRequests, fetchFriends, cancelSentFriendRequest, onlineFriendIds } = useContext(AuthContext);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState<Friend | null>(null);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [manualUsername, setManualUsername] = useState('');
  const [allUsers, setAllUsers] = useState<SearchUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
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

  const filteredFriends = friends.filter((friend) =>
    friend.username.toLowerCase().includes(friendSearch.toLowerCase())
  );

  return (
    <div className="friends-page">
      <div className="friends-header mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="profile-page-title">{t('friends.title')}</h1>
          <div className="friends-search-wrapper">
            <input
              type="text"
              className="friends-search-input w-full px-4 py-3"
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
        <div className="friends-section-header mb-4 flex items-center justify-between">
          <div className="friends-section-title flex items-center">
            <span className="friends-section-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
              </svg>
            </span>
            <h2 className="profile-section-title mb-0">{t('friends.myFriends')}</h2>
            <span className="requests-count inline-flex h-7 items-center justify-center rounded-lg px-3 font-bold">
              {friends.length}
            </span>
          </div>
        </div>

        {friends.length === 0 ? (
          <div className="empty-state">
            <p>{t('friends.noFriends')}</p>
            <p className="empty-hint">{t('teams.findCollaborators')}</p>
          </div>
        ) : (
          <div className="friends-list grid grid-cols-4">
            {filteredFriends.map((friend) => (
              <div key={friend.id} className="friend-card relative flex flex-col items-center rounded-xl px-4 pb-4 pt-5">
                <button
                  className="friend-card-menu"
                  onClick={() => handleRemoveClick(friend)}
                  aria-label={t('friends.remove')}
                >
                  ×
                </button>

                <div className="relative inline-block">
                  <img
                    src={friend.avatar}
                    alt={friend.username}
                    className="friend-avatar h-20 w-20 shrink-0 rounded-full object-cover"
                  />
                  <span
                    className={`status-indicator ${onlineFriendIds.has(friend.id) ? 'online' : 'offline'} absolute bottom-0 right-0`}
                  />
                </div>

                <div className="friend-info min-w-0 text-center">
                  <Link to={`/profile/${friend.id}`} className="friend-name block font-semibold">
                    {friend.username}
                  </Link>
                  <span className={`friend-status ${onlineFriendIds.has(friend.id) ? 'online' : 'offline'}`}>
                    {onlineFriendIds.has(friend.id) ? t('common.online') : t('common.offline')}
                  </span>
                </div>

                <Link
                  to={`/profile/friends/${friend.id}`}
                  className="btn btn-secondary btn-small friend-chat-btn w-4/5"
                >
                  💬 {t('friends.chat')}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pending-requests-section mb-4 rounded-xl p-4">
        <div className="pending-requests-header mb-2 flex items-start justify-start">
          <h2 className="section-title mb-4 text-base font-medium">{t('friends.pendingRequests')}</h2>

          <span className="requests-count inline-flex h-7 items-center justify-center rounded-lg px-3 font-bold">
            {sentRequests.length + friendRequests.length}
          </span>
        </div>

        <div className="received-requests-subsection">
          <h3 className="subsection-title">{t('friends.receivedRequests')}</h3>

          {friendRequests.length === 0 ? (
            <p className="empty-hint">{t('friends.noReceivedRequests')}</p>
          ) : (
            <div className="requests-list flex flex-col gap-0 overflow-hidden rounded-xl">
              {friendRequests.map((request) => (
                <div key={request.request_id} className="request-card grid items-center gap-4 px-4 py-2">
                  <img
                    src={getAvatarUrl(request.user.avatar_url)}
                    alt={request.user.username}
                    className="friend-avatar"
                  />

                  <div className="request-info min-w-0">
                    <Link to={`/profile/${request.user.id}`} className="request-username block font-bold">
                      {request.user.username}
                    </Link>
                    <span className="request-message block">
                      {t('teams.wantsToBeFriends')}
                    </span>
                  </div>

                  <div className="request-actions flex items-center gap-3">
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
            <div className="requests-list flex flex-col gap-0 overflow-hidden rounded-xl">
              {sentRequests.map((request) => (
                <div key={request.request_id} className="request-card grid items-center gap-4 px-4 py-2">
                  <img
                    src={getAvatarUrl(request.user.avatar_url)}
                    alt={request.user.username}
                    className="friend-avatar"
                  />

                  <div className="request-info min-w-0">
                    <Link to={`/profile/${request.user.id}`} className="request-username block font-bold">
                      {request.user.username}
                    </Link>
                    <span className="request-message block">
                      {t('teams.requestSent')}
                    </span>
                  </div>

                  <div className="request-actions flex items-center gap-3">
                    <span className="request-status inline-flex items-center justify-center rounded-lg font-semibold">
                      {t('friends.pending')}
                    </span>
                    <button
                      className="friend-card-menu"
                      aria-label={t('friends.remove')}
                      onClick={() => cancelSentFriendRequest(request.request_id)}
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
        <div className="modal-overlay fixed inset-0 flex items-center justify-center z-[1000] bg-black/50" onClick={() => setShowRemoveModal(false)}>
          <div className="modal w-[70%] max-w-[700px] max-h-[90vh] overflow-y-auto bg-task-gradient border border-border rounded-2xl shadow-task-box-shadow backdrop-blur-[18px]" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex justify-between items-center gap-4 p-4 border-b border-border">
              <h2>{t('friends.removeFriend') || 'Remove Friend'}</h2>
              <button className="modal-close" onClick={() => setShowRemoveModal(false)}>&times;</button>
            </div>
            <div className="modal-body p-5">
              <p className="remove-member-message">
                {t('friends.confirmRemove') || 'Are you sure you want to remove'} <strong>{friendToRemove?.username}</strong> {t('friends.fromFriends') || 'from your friends'}?
              </p>
              <div className="remove-member-actions flex justify-end gap-3 mt-4">
                <button className="btn btn-secondary" onClick={() => setShowRemoveModal(false)}>{t('common.cancel')}</button>
                <button className="btn btn-danger" onClick={handleConfirmRemove}>{t('friends.remove')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddFriendModal && (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center z-[1000] bg-black/50" onClick={() => setShowAddFriendModal(false)}>
          <div className="modal w-[70%] max-w-[700px] max-h-[90vh] overflow-y-auto bg-task-gradient border border-border rounded-2xl shadow-task-box-shadow backdrop-blur-[18px]" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex justify-between items-center gap-4 p-4 border-b border-border">
              <h2>{t('friends.addFriend')}</h2>
              <button className="modal-close" onClick={() => setShowAddFriendModal(false)}>&times;</button>
            </div>
            <div className="modal-body p-5">
              <div className="add-member-method">
                <label className="input-label">{t('friends.selectFromUsers') || 'Select from Users'}</label>
                <div className="add-member-row flex items-center gap-3 mt-2">
                  {loadingUsers && allUsers.length === 0 ? (
                    <span className="loading-text">Loading users...</span>
                  ) : (
                    <>
                      <select
                        className="input flex-1"
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

              <div className="add-member-divider flex items-center gap-4 my-4">
                <span className="flex-1 h-px bg-border" />
                <span className="text-text-secondary text-sm">{t('teams.or')}</span>
                <span className="flex-1 h-px bg-border" />
              </div>

              <div className="add-member-method">
                <label className="input-label">{t('teams.addByUsername')}</label>
                <div className="add-member-row flex items-center gap-3 mt-2">
                  <input
                    type="text"
                    placeholder={t('teams.enterUsername')}
                    className="input flex-1"
                    value={manualUsername}
                    onChange={(e) => setManualUsername(e.target.value)}
                  />
                  <button className="btn btn-primary" onClick={handleAddManual} disabled={loadingUsers}>
                    {loadingUsers ? '...' : t('friends.addFriend')}
                  </button>
                </div>
              </div>

              {availableUsers.length === 0 && friends.length > 0 && !loadingUsers && (
                <p className="empty-hint text-center mt-4">{t('friends.noUsersToAdd') || 'No users available to add'}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Friends;
