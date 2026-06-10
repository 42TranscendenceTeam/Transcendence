/**
 * Login Page Component
 *
 * User authentication page with email/password login.
 * Calls api.checkEmail(), api.login(), and api.verify2FA() from services/api.ts.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../../components/layouts/AuthLayout';
import { api } from '../../services/api';

function Login() {
  const { t } = useTranslation(undefined, { lng: 'en' });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { exists } = await api.checkEmail(email);
      if (!exists) {
        setError(t('auth.login.userNotFound') || 'No account found with this email.');
        setLoading(false);
        return;
      }
      const result = await api.login({ email, password });
      if (result.requires_2fa && result.temp_token) {
        setTempToken(result.temp_token);
        setShow2FA(true);
      } else {
        localStorage.setItem('authToken', result.token);
        window.location.href = '/';
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await api.verify2FA(tempToken, twoFactorCode);
      localStorage.setItem('authToken', result.token);
      window.location.href = '/';
    } catch {
      setError('Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="login-card-header">
        <img src="/logo-icon.png" alt="Transcendence" className="login-card-logo" />
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Glad to see you again! Please sign in to continue.</p>
      </div>

      {error && (
        <div className="text-error text-center mb-4">
          {error}
        </div>
      )}

      {!show2FA ? (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="label" htmlFor="email">{t('auth.login.email')}</label>
            <input
              type="email"
              id="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.login.emailPlaceholder')}
              required
            />
          </div>
          <div className="mb-6">
            <label className="label" htmlFor="password">{t('auth.login.password')}</label>
            <input
              type="password"
              id="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.login.passwordPlaceholder')}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary auth-submit-btn w-full" disabled={loading}>
            {loading ? t('common.loading') : t('auth.login.submit')}
          </button>
          <div className="text-center mb-6">
            <span className="text-text-secondary">{t('auth.login.noAccount')} </span>
            <Link to="/register" className="text-accent">{t('auth.login.register')}</Link>
          </div>
        </form>
      ) : (
        <form onSubmit={handle2FASubmit}>
          <div className="mb-4 text-center">
            <p className="text-text-secondary mb-2">
              {t('auth.login.twoFactorTitle') || 'Two-Factor Authentication'}
            </p>
            <p className="text-sm text-text-secondary">
              {t('auth.login.twoFactorDesc') || 'Enter the 6-digit code from your authenticator app'}
            </p>
          </div>
          <div className="mb-6">
            <label className="label" htmlFor="twoFactorCode">{t('auth.login.verificationCode') || 'Verification Code'}</label>
            <input
              type="text"
              id="twoFactorCode"
              className="input text-center tracking-widest text-xl"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              pattern="[0-9]{6}"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-full mb-4" disabled={loading || twoFactorCode.length !== 6}>
            {loading ? t('common.loading') : t('auth.login.verify') || 'Verify'}
          </button>
          <div className="text-center mb-4">
            <button
              type="button"
              onClick={() => {
                setShow2FA(false);
                setTwoFactorCode('');
                setTempToken('');
              }}
              className="bg-none border-none text-accent cursor-pointer text-sm"
            >
              {t('auth.login.backToLogin') || 'Back to Login'}
            </button>
          </div>
        </form>
      )}

      {!show2FA && (
        <div className="auth-social-section mt-6">
          <div className="auth-divider flex items-center gap-4">
            <span>or continue with</span>
          </div>

          <div className="auth-social-buttons grid grid-cols-2 gap-[0.85rem]">
            <button type="button" className="auth-social-btn flex items-center justify-center gap-3">
              <img src="/42logo.png" alt="42 logo" />
              <span>42 School</span>
            </button>

            <button type="button" className="auth-social-btn flex items-center justify-center gap-3">
              <img src="/google-logo.webp" alt="Google logo" />
              <span>Google</span>
            </button>
          </div>
          <p className="auth-terms-note text-center mt-4">
            By signing in, you agree with our <br />
            <Link to="/terms">Terms of Service</Link>{' '}
            and{' '}
            <Link to="/privacy">Privacy Policy</Link>
          </p>
        </div>
      )}
    </AuthLayout>
  );
}

export default Login;
