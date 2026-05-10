/**
 * Login Page Component
 * 
 * User authentication page with email/password login.
 * Supports both mock mode and real backend API.
 * 
 * Mock Mode (VITE_USE_MOCK=true):
 * - Uses mock 2FA flow for demo
 * 
 * Real Mode (VITE_USE_MOCK=false):
 * - Calls api.login() from services/api.ts
 * - Stores auth token on successful login
 */

import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import AuthLayout from '../../components/layouts/AuthLayout';
import { api } from '../../services/api';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

function Login() {
  const { t } = useTranslation();
  const { loginTestUser } = useContext(AuthContext);
  const navigate = useNavigate();
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

    if (USE_MOCK) {
      try {
        console.log('Login:', { email, password });
        const data = { requires2FA: true, tempToken: 'mock-temp-token' };
        
        if (data.requires2FA) {
          setTempToken(data.tempToken);
          setShow2FA(true);
        } else {
          console.log('Login successful, user data:', data.user);
          window.location.href = '/';
        }
      } catch {
        setError('Login failed. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        const result = await api.login({ email, password });
        localStorage.setItem('authToken', result.token);
        navigate('/');
      } catch (err: any) {
        setError(err.message || 'Login failed. Please check your credentials.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Verifying 2FA code:', { tempToken, code: twoFactorCode });
      window.location.href = '/';
    } catch {
      setError('Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="auth-title">Transcendence</h1>
      
      {error && (
        <div style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {!show2FA ? (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
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
          <div style={{ marginBottom: '1.5rem' }}>
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
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }} disabled={loading}>
            {loading ? t('common.loading') : t('auth.login.submit')}
          </button>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{t('auth.login.noAccount')} </span>
            <Link to="/register" style={{ color: 'var(--accent)' }}>{t('auth.login.register')}</Link>
          </div>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{t('auth.login.justTesting') || 'Just testing?'} </span>
            <button
              type="button"
              onClick={() => {
                loginTestUser();
                window.location.href = '/';
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                textDecoration: 'underline',
                padding: 0,
                marginLeft: '0.25rem',
              }}
            >
              {t('auth.login.useTestLogin') || 'Use TestLogin'}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handle2FASubmit}>
          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              {t('auth.login.twoFactorTitle') || 'Two-Factor Authentication'}
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {t('auth.login.twoFactorDesc') || 'Enter the 6-digit code from your authenticator app'}
            </p>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="label" htmlFor="twoFactorCode">{t('auth.login.verificationCode') || 'Verification Code'}</label>
            <input
              type="text"
              id="twoFactorCode"
              className="input"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              pattern="[0-9]{6}"
              required
              style={{ textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.25rem' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }} disabled={loading || twoFactorCode.length !== 6}>
            {loading ? t('common.loading') : t('auth.login.verify') || 'Verify'}
          </button>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <button
              type="button"
              onClick={() => {
                setShow2FA(false);
                setTwoFactorCode('');
                setTempToken('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              {t('auth.login.backToLogin') || 'Back to Login'}
            </button>
          </div>
        </form>
      )}
      
      {!show2FA && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <button type="button" className="btn btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <img src="/42logo.png" alt="42 logo" style={{ width: '20px', height: '20px' }} />
            {t('auth.login.signInWith42') || 'Sign in with 42'}
          </button>
        </div>
      )}
    </AuthLayout>
  );
}

export default Login;