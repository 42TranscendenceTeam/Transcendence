import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function Friends() {
  const { user, removeFriend, addFriend, findUserByUsername } = useContext(AuthContext);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState(null);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [manualUsername, setManualUsername] = useState('');

  if (!user) {
    return null;
  }

  // TODO: Remove dummy data - Send GET /api/users/search?q= or GET /api/users/recommended
  const availableUsers = user.friends.length > 0
    ? [
        { id: 1, username: 'Felix', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
        { id: 2, username: 'Luna', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna' },
        { id: 3, username: 'Alex', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
        { id: 4, username: 'Max', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Max' },
      ].filter((u) => !user.friends.some((f) => f.id === u.id))
    : [];

  const handleRemoveClick = (friend) => {
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
      addFriend(userToAdd);
      setSelectedUser('');
      setShowAddFriendModal(false);
    }
  };

  // TODO: Send GET /api/users/search?q={username}, verify user exists before adding
  const handleAddManual = () => {
    if (!manualUsername.trim()) return;
    const foundUser = findUserByUsername(manualUsername.trim());
    if (foundUser && !user.friends.some((f) => f.id === foundUser.id)) {
      addFriend(foundUser);
      setManualUsername('');
      setShowAddFriendModal(false);
    }
  };

  return (
    <div className="friends-page">
      <div className="friends-header">
        <h1 className="profile-page-title">Friends</h1>
        <button className="btn btn-primary btn-small" onClick={() => setShowAddFriendModal(true)}>
          + Add Friend
        </button>
      </div>
      <p className="profile-page-subtitle">You have {user.friends.length} friends</p>

      <div className="friends-list">
        {user.friends.map((friend) => (
          <div key={friend.id} className="friend-card">
            <img src={friend.avatar} alt={friend.username} className="friend-avatar" />
            <div className="friend-info">
              <span className="friend-name">{friend.username}</span>
            </div>
            <Link
              to={`/profile/friends/${friend.id}`}
              className="btn btn-secondary btn-small"
            >
              Chat
            </Link>
            <button
              className="btn btn-secondary btn-small"
              onClick={() => handleRemoveClick(friend)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {user.friends.length === 0 && (
        <div className="empty-state">
          <p>You have no friends yet.</p>
          <p className="empty-hint">Find collaborators on the home page!</p>
        </div>
      )}

      {/* Remove Friend Modal */}
      {showRemoveModal && (
        <div className="modal-overlay" onClick={() => setShowRemoveModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Remove Friend</h2>
              <button className="modal-close" onClick={() => setShowRemoveModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p className="remove-member-message">
                Are you sure you want to remove <strong>{friendToRemove?.username}</strong> from your friends?
              </p>
              <div className="remove-member-actions">
                <button className="btn btn-secondary" onClick={() => setShowRemoveModal(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleConfirmRemove}>Remove</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Friend Modal */}
      {showAddFriendModal && (
        <div className="modal-overlay" onClick={() => setShowAddFriendModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Friend</h2>
              <button className="modal-close" onClick={() => setShowAddFriendModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="add-member-method">
                <label className="input-label">Select from Users</label>
                <div className="add-member-row">
                  <select
                    className="input"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                  >
                    <option value="">Select a user...</option>
                    {availableUsers.map((u) => (
                      <option key={u.id} value={u.username}>{u.username}</option>
                    ))}
                  </select>
                  <button className="btn btn-primary" onClick={handleAddFromDropdown}>Add</button>
                </div>
              </div>

              <div className="add-member-divider">OR</div>

              <div className="add-member-method">
                <label className="input-label">Add by Username</label>
                <div className="add-member-row">
                  <input
                    type="text"
                    placeholder="Enter username"
                    className="input"
                    value={manualUsername}
                    onChange={(e) => setManualUsername(e.target.value)}
                  />
                  <button className="btn btn-primary" onClick={handleAddManual}>Add</button>
                </div>
              </div>

              {availableUsers.length === 0 && user.friends.length > 0 && (
                <p className="empty-hint text-center">No users available to add</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Friends;