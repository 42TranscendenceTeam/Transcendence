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
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import LanguageSelector from '../../components/LanguageSelector';

function ProfileEdit() {
  const { t, i18n } = useTranslation();
  const { user, updateUser } = useContext(AuthContext);

  const initialUsername = user?.username || '';
  const initialEmail = user?.email || '';
  const initialDescription = user?.description || '';
  const initialAvatar = user?.avatar || '';

  const [username, setUsername] = useState(initialUsername);
  const [email, setEmail] = useState(initialEmail);
  const [description, setDescription] = useState(initialDescription);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatar);
  const [language, setLanguage] = useState(i18n.language);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert('Avatar upload is not yet implemented.');
    }
  };

  const avatarSeeds = ['Felix', 'Luna', 'Alex', 'Max', 'Nina', 'Sam', 'Kate', 'John'];
  const avatarOptions = avatarSeeds.map((seed) => ({
    seed,
    url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
  }));

  const hasChanges = 
    username !== initialUsername ||
    email !== initialEmail ||
    description !== initialDescription ||
    avatarUrl !== initialAvatar ||
    language !== i18n.language;

  const getChangesSummary = () => {
    const changes: string[] = [];
    if (username !== initialUsername) {
      changes.push(`${t('profile.edit.username')}: ${initialUsername} → ${username}`);
    }
    if (email !== initialEmail) {
      changes.push(`${t('profile.edit.email')}: ${initialEmail} → ${email}`);
    }
    if (description !== initialDescription) {
      changes.push(`${t('profile.edit.description')} updated`);
    }
    if (avatarUrl !== initialAvatar) {
      changes.push(`${t('profile.edit.avatar')} changed`);
    }
    if (language !== i18n.language) {
      const langNames: Record<string, string> = { en: 'English', fr: 'Français', pt: 'Português' };
      changes.push(`${t('profile.edit.language')}: ${langNames[i18n.language] || i18n.language} → ${langNames[language] || language}`);
    }
    return changes;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    if (language !== i18n.language) {
      i18n.changeLanguage(language);
    }
    updateUser({ username, email, description, avatar: avatarUrl });
    setShowConfirmModal(false);
    setShowSuccessModal(true);
  };

  const handleCancel = () => {
    setLanguage(i18n.language);
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
          <label className="label">{t('profile.edit.currentAvatar')}</label>
          <div className="avatar-preview">
            <img src={avatarUrl || user.avatar} alt="Avatar preview" />
          </div>
          <p className="label-small">{t('profile.edit.selectDefaultAvatar')}</p>
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
          <div className="avatar-upload">
            <label className="upload-label">
              {t('profile.edit.uploadAvatar')}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleAvatarUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>

        <button type="submit" className="btn btn-primary">{t('profile.edit.saveChanges')}</button>
      </form>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{hasChanges ? t('profile.edit.confirmChanges') : t('profile.edit.noChanges')}</h2>
              <button className="modal-close" onClick={handleCancel}>&times;</button>
            </div>
            <div className="modal-body">
              {hasChanges ? (
                <>
                  <p className="confirm-message">
                    {t('profile.edit.confirmMessage')}
                  </p>
                  <div className="changes-summary">
                    <p className="changes-label">{t('profile.edit.changesToSave')}</p>
                    <ul className="changes-list">
                      {getChangesSummary().map((change, index) => (
                        <li key={index}>{change}</li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <p className="confirm-message">
                  {t('profile.edit.noChangesMessage')}
                </p>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={handleCancel}>
                {hasChanges ? t('common.cancel') : t('common.close')}
              </button>
              {hasChanges && (
                <button className="btn btn-primary" onClick={handleConfirm}>
                  {t('common.confirm')}
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