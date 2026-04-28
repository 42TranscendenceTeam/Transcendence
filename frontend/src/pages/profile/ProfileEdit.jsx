import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

function ProfileEdit() {
  const { user, updateUser } = useContext(AuthContext);

  const [username, setUsername] = useState(user?.username || '');
  const [description, setDescription] = useState(user?.description || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');

  const avatarSeeds = ['Felix', 'Luna', 'Alex', 'Max', 'Nina', 'Sam', 'Kate', 'John'];
  const avatarOptions = avatarSeeds.map((seed) => ({
    seed,
    url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
  }));

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUser({ username, description, avatar: avatarUrl });
    alert('Profile updated successfully!');
  };

  const selectPresetAvatar = (url) => {
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
          <p className="label-small">Select a preset avatar:</p>
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
    </div>
  );
}

export default ProfileEdit;