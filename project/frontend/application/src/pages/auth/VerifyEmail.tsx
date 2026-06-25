import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layouts/AuthLayout';
import { api } from '../../services/api';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!token || !email) {
    return (
      <AuthLayout>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 className="auth-title">Invalid Link</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            This verification link is invalid or has expired.
          </p>
          <button
            className="btn btn-primary"
            style={{ marginTop: '1rem' }}
            onClick={() => navigate('/register')}
          >
            Back to Registration
          </button>
        </div>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await api.verifyEmail(token, code);
      sessionStorage.setItem('authToken', result.token);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    window.location.href = '/';
  };

  return (
    <AuthLayout>
      <div className="login-card-header">
        <img src="/logo-icon.png" alt="Transcendence" className="login-card-logo" />
        <h1 className="auth-title">Verify Your Email</h1>
        <p className="auth-subtitle">
          We sent a code to {decodeURIComponent(email)}
        </p>
      </div>

      {error && (
        <div style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {!success ? (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="label" htmlFor="code">Verification Code</label>
            <input
              type="text"
              id="code"
              className="input"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              pattern="[0-9]{6}"
              required
              style={{ textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.25rem' }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '1rem' }}
            disabled={loading || code.length !== 6}
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => navigate('/register')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Back to Registration
            </button>
          </div>
        </form>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="success-icon" style={{ marginBottom: '1rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '48px', height: '48px', color: '#22c55e' }}>
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
              </svg>
            </div>
            <p style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '0.5rem' }}>
              Email Verified!
            </p>
            <p style={{ color: 'var(--text-secondary)' }}>
              Your account has been created successfully.
            </p>
          </div>
          <button
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={handleContinue}
          >
            Continue
          </button>
        </div>
      )}
    </AuthLayout>
  );
}

export default VerifyEmail;