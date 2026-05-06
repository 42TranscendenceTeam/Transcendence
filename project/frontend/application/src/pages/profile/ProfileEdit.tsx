/**
 * Profile Edit Page Component
 * 
 * Allows user to edit their profile including:
 * - Avatar selection
 * - Username
 * - Email
 * - Description
 * 
 * TODO: Connect to real API when backend is ready
 */

import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

function ProfileEdit() {
  const { user, updateUser } = useContext(AuthContext);

  const initialUsername = user?.username || '';
  const initialEmail = user?.email || '';
  const initialDescription = user?.description || '';
  const initialAvatar = user?.avatar || '';

  const [username, setUsername] = useState(initialUsername);
  const [email, setEmail] = useState(initialEmail);
  const [description, setDescription] = useState(initialDescription);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatar);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const avatarSeeds = ['Felix', 'Luna', 'Alex', 'Max', 'Nina', 'Sam', 'Kate', 'John'];
  const avatarOptions = avatarSeeds.map((seed) => ({
    seed,
    url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
  }));

  const hasChanges = 
    username !== initialUsername ||
    email !== initialEmail ||
    description !== initialDescription ||
    avatarUrl !== initialAvatar;

  const getChangesSummary = () => {
    const changes: string[] = [];
    if (username !== initialUsername) {
      changes.push(`Username: ${initialUsername} → ${username}`);
    }
    if (email !== initialEmail) {
      changes.push(`Email: ${initialEmail} → ${email}`);
    }
    if (description !== initialDescription) {
      changes.push(`Description updated`);
    }
    if (avatarUrl !== initialAvatar) {
      changes.push(`Avatar changed`);
    }
    return changes;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    updateUser({ username, email, description, avatar: avatarUrl });
    setShowConfirmModal(false);
    setShowSuccessModal(true);
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
  };

  const selectPresetAvatar = (url: string) => {
    setAvatarUrl(url);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="profile-edit-page">
      <h1 className="profile-page-title">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label className="label">Username</label>
          <input
            type="text"
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="label">Email</label>
          <input
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>

        <div className="form-group">
          <label className="label">Description</label>
          <textarea
            className="input textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell us about yourself..."
            rows={3}
          />
        </div>

        <div className="form-group">
          <label className="label">Avatar</label>
          <div className="avatar-preview">
            <img src={avatarUrl || user.avatar} alt="Avatar preview" />
          </div>
          <p className="label-small">Select an avatar:</p>
          <div className="avatar-options">
            {avatarOptions.map((option) => (
              <button
                key={option.seed}
                type="button"
                className={`avatar-option ${avatarUrl === option.url ? 'selected' : ''}`}
                onClick={() => selectPresetAvatar(option.url)}
              >
                <img src={option.url} alt={option.seed} />
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className="btn btn-primary">Save Changes</button>
      </form>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{hasChanges ? 'Confirm Changes' : 'No Changes'}</h2>
              <button className="modal-close" onClick={handleCancel}>&times;</button>
            </div>
            <div className="modal-body">
              {hasChanges ? (
                <>
                  <p className="confirm-message">
                    Are you sure you want to save these changes?
                  </p>
                  <div className="changes-summary">
                    <p className="changes-label">Changes to be saved:</p>
                    <ul className="changes-list">
                      {getChangesSummary().map((change, index) => (
                        <li key={index}>{change}</li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <p className="confirm-message">
                  No changes have been made to your profile.
                </p>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={handleCancel}>
                {hasChanges ? 'Cancel' : 'Close'}
              </button>
              {hasChanges && (
                <button className="btn btn-primary" onClick={handleConfirm}>
                  Confirm
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay" onClick={handleSuccessClose}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Success</h2>
              <button className="modal-close" onClick={handleSuccessClose}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="success-content">
                <div className="success-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.22-.149l.97-1.164a.75.75 0 00.17-.263z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="success-message">
                  Profile updated successfully!
                </p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleSuccessClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileEdit;