/**
 * Profile Edit Page Component
 *
 * Allows user to edit their profile including:
 * - Avatar upload
 * - Language
 */

import { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { api } from '../../services/api';
import LanguageSelector from '../../components/LanguageSelector';

function ProfileEdit() {
  const { t, i18n } = useTranslation();
  const { user, updateUser, toggle2FA } = useContext(AuthContext);

  const initialUsername = user?.username || '';
  const initialEmail = user?.email || '';
  const initialDescription = user?.description || '';
  const initialAvatar = user?.avatar || '';

  const [username, setUsername] = useState(initialUsername);
  const [email, setEmail] = useState(initialEmail);
  const [description, setDescription] = useState(initialDescription);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatar);
  const [language, setLanguage] = useState((i18n.language || '').split('-')[0] || 'en');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const MAX_SIZE = 4.5 * 1024 * 1024;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    if (file.size > MAX_SIZE) {
      setUploadError(t('profile.edit.uploadTooLarge'));
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError(t('profile.edit.uploadInvalidType'));
      return;
    }
    setIsUploading(true);
    try {
      const result = await api.uploadAvatar(file);
      setAvatarUrl(result.avatar_url);
      updateUser({ avatar: result.avatar_url });
    } catch (err: any) {
      setUploadError(err.message || t('profile.edit.uploadFailed'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await api.updateCurrentUser({
        username,
        email,
        description,
      });
      updateUser({
        username: result.username,
        email: result.email,
        description: result.description,
      });
    } catch (err: any) {
      setUploadError(err.message || 'Failed to update profile');
      return;
    }
    if (language !== i18n.language) {
      i18n.changeLanguage(language);
    }
    if (user && twoFactorEnabled !== user.twoFactorEnabled) {
      await toggle2FA();
      updateUser({ twoFactorEnabled });
    }
    setShowSuccessModal(true);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="profile-edit-page">
      <h1 className="profile-page-title">{t('profile.edit.title')}</h1>

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label className="label">{t('profile.edit.username')}</label>
          <input
            type="text"
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="label">{t('profile.edit.email')}</label>
          <input
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.login.emailPlaceholder')}
          />
        </div>

        <div className="form-group">
          <label className="label">{t('profile.edit.description')}</label>
          <textarea
            className="input textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('profile.edit.descriptionPlaceholder')}
            rows={3}
          />
        </div>

        <div className="form-group">
          <label className="label">{t('profile.edit.language')}</label>
          <LanguageSelector value={language} onChange={setLanguage} />
        </div>

        <div className="form-group">
          <label className="label">{t('profile.security.twoFactor')}</label>
          <div className="security-section profile-edit-security-section">
            <p className="security-description">
              {t('profile.security.twoFactorDesc')}
            </p>
            <div className="security-toggle">
              <label className="security-toggle-label">
                <input
                  type="checkbox"
                  checked={twoFactorEnabled}
                  onChange={() => setTwoFactorEnabled(!twoFactorEnabled)}
                />
                <span className="toggle-text">
                  {twoFactorEnabled ? t('profile.security.enable') : t('profile.security.disable')}
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="label">{t('profile.edit.currentAvatar')}</label>
          <div className="avatar-preview">
            <img src={avatarUrl || user.avatar} alt="Avatar preview" />
          </div>
          <div className="avatar-upload">
            <label className={`upload-label ${isUploading ? 'uploading' : ''}`}>
              {isUploading ? (
                <>
                  <svg className="upload-spinner" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  {t('profile.edit.uploading')}
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                  </svg>
                  {t('profile.edit.uploadAvatar')}
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={isUploading}
                style={{ display: 'none' }}
              />
            </label>
            {uploadError && <p className="avatar-upload-error">{uploadError}</p>}
          </div>
        </div>

        <button type="submit" className="btn btn-primary save-profile-btn">{t('profile.edit.saveChanges')}</button>
      </form>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay" onClick={handleSuccessClose}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('common.success')}</h2>
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
                  {t('profile.edit.success')}
                </p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleSuccessClose}>
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileEdit;
