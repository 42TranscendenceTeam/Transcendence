/**
 * Registration Page Component
 *
 * New user registration page with validation.
 * Calls api.register() to create account.
 *
 * Validation:
 * - Username required
 * - Email format validation
 * - Password required
 * - Confirm password must match
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../../components/layouts/AuthLayout';
import { api } from '../../services/api';

function Register() {
  const { t } = useTranslation(undefined, { lng: 'en' });
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    if (!email) {
      setError('Email is required');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const result = await api.register({ email, username, password });
      localStorage.setItem('authToken', result.token);
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="label" htmlFor="username">{t('auth.register.username')}</label>
          <input
            type="text"
            id="username"
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t('auth.register.usernamePlaceholder')}
          />
        </div>
        <div className="mb-4">
          <label className="label" htmlFor="email">{t('auth.register.email')} ({t('common.optional')})</label>
          <input
            type="email"
            id="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.register.emailPlaceholder')}
          />
        </div>
        <div className="mb-4">
          <label className="label" htmlFor="password">{t('auth.register.password')}</label>
          <input
            type="password"
            id="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.register.passwordPlaceholder')}
          />
        </div>
        <div className="mb-6">
          <label className="label" htmlFor="confirmPassword">{t('auth.register.confirmPassword')}</label>
          <input
            type="password"
            id="confirmPassword"
            className="input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t('auth.register.confirmPasswordPlaceholder')}
          />
        </div>
        <button type="submit" className="btn btn-primary auth-submit-btn w-full" disabled={loading}>
            {loading ? t('common.loading') : t('auth.register.submit')}
          </button>
          {error && (
            <div className="text-center text-error text-sm mb-4">
              {error}
            </div>
          )}
          <div className="text-center">
            <span className="text-text-secondary">{t('auth.register.hasAccount')} </span>
            <Link to="/login" className="text-accent">{t('auth.register.login')}</Link>
          </div>
      </form>

      {showSuccessModal && (
        <div className="modal-overlay" onClick={() => {}}>
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
                <p className="success-message">{t('auth.register.success')}</p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => { window.location.href = '/'; }}>
                {t('common.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}

export default Register;
