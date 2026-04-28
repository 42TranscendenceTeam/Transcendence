import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

function Security() {
  const { user, toggle2FA } = useContext(AuthContext);

  if (!user) {
    return null;
  }

  return (
    <div className="security-page">
      <h1 className="profile-page-title">Security</h1>
      <p className="profile-page-subtitle">Manage your account security settings</p>

      <div className="security-section">
        <h2 className="security-section-title">Two-Factor Authentication</h2>
        <p className="security-description">
          Add an extra layer of security to your account by enabling two-factor authentication.
        </p>
        <label className="security-toggle">
          {/* TODO: Fetch from /api/users/me, receive {twoFactorEnabled, twoFactorSecret} for setup flow */}
          <input
            type="checkbox"
            checked={user.twoFactorEnabled}
            onChange={toggle2FA}
          />
          <span className="toggle-switch"></span>
          <span className="toggle-text">
            {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </label>
      </div>
    </div>
  );
}

export default Security;