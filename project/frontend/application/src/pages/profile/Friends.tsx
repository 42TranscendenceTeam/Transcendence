/**
 * Friends List Page Component
 * 
 * Displays user's friends list.
 * Mock data currently used.
 * 
 * TODO: Connect to real API when backend is ready
 */

import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import type { Friend } from '../../types';

function Friends() {
  const { t } = useTranslation();
  const { user, removeFriend, addFriend, findUserByUsername } = useContext(AuthContext);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState<Friend | null>(null);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [manualUsername, setManualUsername] = useState('');

  if (!user) {
    return null;
  }

  const availableUsers = user.friends.length > 0
    ? [
        { id: 1, username: 'Felix', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', chat: [] },
        { id: 2, username: 'Luna', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna', chat: [] },
        { id: 3, username: 'Alex', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', chat: [] },
        { id: 4, username: 'Max', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Max', chat: [] },
      ].filter((u) => !user.friends.some((f) => f.id === u.id))
    : [];

  const handleRemoveClick = (friend: Friend) => {
    setFriendToRemove(friend);
    setShowRemoveModal(true);
  };

  const handleConfirmRemove = () => {
    if (friendToRemove) {
      removeFriend(friendToRemove.id);
      setShowRemoveModal(false);
      setFriendToRemove(null);
    }
  };

  const handleAddFromDropdown = () => {
    if (!selectedUser) return;
    const userToAdd = availableUsers.find((u) => u.username === selectedUser);
    if (userToAdd) {
      addFriend(userToAdd as Friend);
      setSelectedUser('');
      setShowAddFriendModal(false);
    }
  };

  const handleAddManual = () => {
    if (!manualUsername.trim()) return;
    const foundUser = findUserByUsername(manualUsername.trim());
    if (foundUser && !user.friends.some((f) => f.id === foundUser.id)) {
      addFriend({ id: foundUser.id, username: foundUser.username, avatar: foundUser.avatar, chat: [] });
      setManualUsername('');
      setShowAddFriendModal(false);
    }
  };

  return (
    <div className="friends-page">
      <div className="friends-header">
        <h1 className="profile-page-title">{t('friends.title')}</h1>
        <button className="btn btn-primary btn-small" onClick={() => setShowAddFriendModal(true)}>
          + {t('friends.addFriend')}
        </button>
      </div>
      <p className="profile-page-subtitle">{t('friends.youHave') || 'You have'} {user.friends.length} {t('friends.title').toLowerCase()}</p>

      <div className="friends-list">
        {user.friends.map((friend) => (
          <div key={friend.id} className="friend-card">
            <img src={friend.avatar} alt={friend.username} className="friend-avatar" />
            <div className="friend-info">
              <span className="friend-name">{friend.username}</span>
              <span className={`friend-status ${friend.isOnline ? 'online' : 'offline'}`}>
                {friend.isOnline ? t('common.online') : t('common.offline')}
              </span>
            </div>
            <Link
              to={`/profile/friends/${friend.id}`}
              className="btn btn-secondary btn-small"
            >
              {t('friends.chat')}
            </Link>
            <button
              className="btn btn-secondary btn-small"
              onClick={() => handleRemoveClick(friend)}
            >
              {t('friends.remove')}
            </button>
          </div>
        ))}
      </div>

      {user.friends.length === 0 && (
        <div className="empty-state">
          <p>{t('friends.noFriends')}</p>
          <p className="empty-hint">{t('teams.findCollaborators')}</p>
        </div>
      )}

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
                  <button className="btn btn-primary" onClick={handleAddFromDropdown}>{t('common.add')}</button>
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
                  <button className="btn btn-primary" onClick={handleAddManual}>{t('common.add')}</button>
                </div>
              </div>

              {availableUsers.length === 0 && user.friends.length > 0 && (
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