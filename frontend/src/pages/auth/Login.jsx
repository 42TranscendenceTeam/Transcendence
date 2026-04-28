import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import AuthLayout from '../../components/layouts/AuthLayout';

function Login() {
  const { loginTestUser } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // TODO: POST /api/auth/login with {username, password}
  // - Receive: {requires2FA: boolean, tempToken?: string} or {token, user} or {error}
  // - If requires2FA: true, show 2FA input, then POST /api/auth/verify-2fa with {tempToken, code}
  // - Receive: {token, user}
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simulating backend response for now - Replace with actual API call
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ username, password }),
      // });
      // const data = await response.json();

      // Mock response for development
      console.log('Login:', { username, password });
      
      // Simulate 2FA check - in real app, backend determines this
      const data = { requires2FA: true, tempToken: 'mock-temp-token' };
      
      if (data.requires2FA) {
        setTempToken(data.tempToken);
        setShow2FA(true);
      } else {
        // TODO: Replace mock with actual user data from backend
        // loginTestUser(); // Remove this after backend
        console.log('Login successful, user data:', data.user);
        window.location.href = '/profile';
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle 2FA code submission
  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // TODO: POST /api/auth/verify-2fa with {tempToken, code: twoFactorCode}
      // - Receive: {token, user} or {error: 'Invalid code'}
      // const response = await fetch('/api/auth/verify-2fa', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ tempToken, code: twoFactorCode }),
      // });
      // const data = await response.json();

      // Mock response for development
      console.log('Verifying 2FA code:', { tempToken, code: twoFactorCode });
      
      // Simulate successful verification
      // const data = { token: 'mock-jwt-token', user: {...} };
      
      // TODO: Store token and set user context, then redirect
      window.location.href = '/profile';
    } catch (err) {
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
            <label className="label" htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="label" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Don't have an account? </span>
            <Link to="/register" style={{ color: 'var(--accent)' }}>Sign up</Link>
          </div>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Just testing? </span>
            <button
              type="button"
              onClick={() => {
                loginTestUser();
                window.location.href = '/profile';
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
              Use TestLogin
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handle2FASubmit}>
          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Two-Factor Authentication
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Enter the 6-digit code from your authenticator app
            </p>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="label" htmlFor="twoFactorCode">Verification Code</label>
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
            {loading ? 'Verifying...' : 'Verify'}
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
              Back to Login
            </button>
          </div>
        </form>
      )}
      
      {/* TODO: Redirect to 42 OAuth, handle callback at /auth/42/callback, receive {token, user} */}
      {!show2FA && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <button type="button" className="btn btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <img src="/42logo.png" alt="42 logo" style={{ width: '20px', height: '20px' }} />
            Sign in with 42
          </button>
        </div>
      )}
    </AuthLayout>
  );
}

export default Login;