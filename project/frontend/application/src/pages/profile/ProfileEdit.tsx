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
import { useError } from '../../context/ErrorContext';
import { api } from '../../services/api';
import LanguageSelector from '../../components/LanguageSelector';

function ProfileEdit() {
  const { t, i18n } = useTranslation();
  const { user, updateUser, toggle2FA } = useContext(AuthContext);
  const { showError } = useError();

  const initialUsername = user?.username || '';
  const initialEmail = user?.email || '';
  const initialDescription = user?.description || '';
  const initialAvatar = user?.avatar || '';

  const [username, setUsername] = useState(initialUsername);
  const [description, setDescription] = useState(initialDescription);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatar);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
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
    setAvatarFile(file);
    setAvatarUrl(URL.createObjectURL(file));
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.length > 25) {
      showError(t('common.error'), t('profile.edit.usernameTooLong'));
      return;
    }
    if (description.length > 100) {
      showError(t('common.error'), t('profile.edit.descriptionTooLong'));
      return;
    }
    setIsUploading(true);
    let newAvatarUrl = avatarUrl;
    try {
      if (avatarFile) {
        const result = await api.uploadAvatar(avatarFile);
        newAvatarUrl = result.avatar_url;
        setAvatarUrl(result.avatar_url);
      }
      const result = await api.updateCurrentUser({
        username,
        description,
      });
      updateUser({
        username: result.username,
        description: result.description,
        avatar: newAvatarUrl,
      });
    } catch (err: any) {
      setUploadError(err.message || 'Failed to update profile');
      setIsUploading(false);
      return;
    }
    if (language !== i18n.language) {
      i18n.changeLanguage(language);
    }
    if (user && twoFactorEnabled !== user.twoFactorEnabled) {
      await toggle2FA();
      updateUser({ twoFactorEnabled });
    }
    setAvatarFile(null);
    setIsUploading(false);
    setShowSuccessModal(true);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="profile-edit-page w-full">
      <h1 className="profile-page-title">{t('profile.edit.title')}</h1>

      <form onSubmit={handleSubmit} className="profile-form flex flex-col gap-1">
        <div className="form-group flex flex-col gap-2 mb-4">
          <label className="label">{t('profile.edit.username')}</label>
          <input
            type="text"
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group flex flex-col gap-2 mb-4">
          <label className="label">{t('profile.edit.email')} ({t('profile.edit.emailNotEditable')})</label>
          <input
            type="email"
            className="input"
            value={user?.email || ''}
            disabled
          />
        </div>

        <div className="form-group flex flex-col gap-2 mb-4">
          <label className="label">{t('profile.edit.description')}</label>
          <textarea
            className="input textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('profile.edit.descriptionPlaceholder')}
            rows={3}
          />
        </div>

        <div className="form-group flex flex-col gap-2 mb-4">
          <label className="label">{t('profile.edit.language')}</label>
          <LanguageSelector value={language} onChange={setLanguage} />
        </div>

        <div className="form-group flex flex-col gap-2 mb-4">
          <label className="label">{t('profile.security.twoFactor')}</label>
          <div className="security-section profile-edit-security-section bg-bg-card border border-border rounded-xl p-6 mb-4">
            <div className="security-toggle flex items-center gap-3 cursor-pointer">
              <label className="security-toggle-label flex items-center">
                <input
                  type="checkbox"
                  checked={twoFactorEnabled}
                  onChange={() => setTwoFactorEnabled(!twoFactorEnabled)}
                />
                <span className="toggle-text font-medium text-text-primary ml-2">
                  {twoFactorEnabled ? t('profile.security.enable') : t('profile.security.disable')}
                </span>
              </label>
            </div>
            <p className="security-description">
              {t('profile.security.twoFactorDesc')}
            </p>
          </div>
        </div>

        <div className="form-group flex flex-col gap-2 mb-4">
          <label className="label">{t('profile.edit.currentAvatar')}</label>
          <div className="avatar-preview w-20 h-20 rounded-full overflow-hidden mb-2">
            <img src={avatarUrl || user.avatar} alt="Avatar preview" />
          </div>
          <div className="avatar-upload">
            <label className={`upload-label inline-flex items-center gap-2 px-4 py-2 bg-bg-input border-2 border-border rounded-lg text-text-secondary text-sm cursor-pointer hover:border-accent hover:text-accent ${isUploading ? 'uploading' : ''}`}>
              {isUploading ? (
                <>
                  <svg className="upload-spinner w-[18px] h-[18px] shrink-0 animate-spin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  {t('profile.edit.uploading')}
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
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
            {uploadError && <p className="avatar-upload-error text-xs text-error mt-2">{uploadError}</p>}
          </div>
        </div>

        <button type="submit" className="btn btn-primary save-profile-btn mt-6">{t('profile.edit.saveChanges')}</button>
      </form>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center z-[1000] bg-black/50" onClick={handleSuccessClose}>
          <div className="modal w-[70%] max-w-[700px] max-h-[90vh] overflow-y-auto bg-task-gradient border border-border rounded-2xl shadow-task-box-shadow backdrop-blur-[18px]" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex justify-between items-center gap-4 p-4 border-b border-border">
              <h2>{t('common.success')}</h2>
              <button className="modal-close" onClick={handleSuccessClose}>&times;</button>
            </div>
            <div className="modal-body p-5">
              <div className="success-content text-center p-4">
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
            <div className="modal-actions flex justify-end gap-3 mb-4 mr-4">
              <button className="btn btn-primary" onClick={handleSuccessClose}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileEdit;
