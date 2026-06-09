/**
 * Security Settings Page Component
 * 
 * Security settings including:
 * - Password change
 * - Two-factor authentication toggle
 * 
 * TODO: Connect to real API when backend is ready
 */

import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';

function Security() {
  const { t } = useTranslation();
  const { user, toggle2FA } = useContext(AuthContext);
  const [show2FASuccessModal, setShow2FASuccessModal] = useState(false);

  if (!user) {
    return null;
  }

  const handle2FAToggle = async () => {
    const enabled = await toggle2FA();
    if (enabled) {
      setShow2FASuccessModal(true);
    }
  };

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
              onChange={handle2FAToggle}
            />
            <span className="toggle-text">
              {user.twoFactorEnabled ? t('profile.security.enable') : t('profile.security.disable')}
            </span>
          </label>
        </div>
      </div>

      {show2FASuccessModal && (
        <div className="modal-overlay" onClick={() => setShow2FASuccessModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('common.success')}</h2>
            </div>
            <div className="modal-body">
              <div className="success-content">
                <div className="success-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="success-message">{t('profile.security.twoFactorEnabled')}</p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => setShow2FASuccessModal(false)}>
                {t('common.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Security;