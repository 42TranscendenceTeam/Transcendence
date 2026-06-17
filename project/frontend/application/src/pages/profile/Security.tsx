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
    <div className="security-page w-full">
      <h1 className="profile-page-title">{t('profile.security.title')}</h1>
      <p className="profile-page-subtitle">{t('profile.security.desc') || 'Manage your account security settings'}</p>

      <div className="security-section bg-bg-card border border-border rounded-xl p-6 mb-4">
        <h2 className="security-section-title text-base font-medium mb-2">{t('profile.security.twoFactor')}</h2>
        <p className="security-description text-sm text-text-secondary mb-4">
          {t('profile.security.twoFactorDesc')}
        </p>
        <div className="security-toggle flex items-center gap-3 cursor-pointer">
          <label className="security-toggle-label flex items-center">
            <input
              type="checkbox"
              checked={user.twoFactorEnabled}
              onChange={handle2FAToggle}
            />
            <span className="toggle-text font-medium text-text-primary ml-2">
              {user.twoFactorEnabled ? t('profile.security.enable') : t('profile.security.disable')}
            </span>
          </label>
        </div>
      </div>

      {show2FASuccessModal && (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center z-[1000] bg-black/50" onClick={() => setShow2FASuccessModal(false)}>
          <div className="modal w-[70%] max-w-[700px] max-h-[90vh] overflow-y-auto bg-task-gradient border border-border rounded-2xl shadow-task-box-shadow backdrop-blur-[18px]" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex justify-between items-center gap-4 p-4 border-b border-border">
              <h2>{t('common.success')}</h2>
            </div>
            <div className="modal-body p-5">
              <div className="success-content text-center p-4">
                <div className="success-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.22-.149l.97-1.164a.75.75 0 00.17-.263z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="success-message">{t('profile.security.twoFactorEnabled')}</p>
              </div>
            </div>
            <div className="modal-actions flex justify-end gap-3">
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