/**
 * Security Settings Page Component
 * 
 * Security settings including:
 * - Password change
 * - Two-factor authentication toggle
 * 
 * TODO: Connect to real API when backend is ready
 */

import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';

function Security() {
  const { t } = useTranslation();
  const { user, toggle2FA } = useContext(AuthContext);

  if (!user) {
    return null;
  }

  return (
    <div className="security-page">
      <h1 className="profile-page-title">{t('profile.security.title')}</h1>
      <p className="profile-page-subtitle">{t('profile.security.desc') || 'Manage your account security settings'}</p>

      <div className="security-section">
        <h2 className="security-section-title">{t('profile.security.twoFactor')}</h2>
        <p className="security-description">
          {t('profile.security.twoFactorDesc')}
        </p>
        <div className="security-toggle">
          <label className="security-toggle-label">
            <input
              type="checkbox"
              checked={user.twoFactorEnabled}
              onChange={toggle2FA}
            />
            <span className="toggle-text">
              {user.twoFactorEnabled ? t('profile.security.enable') : t('profile.security.disable')}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default Security;