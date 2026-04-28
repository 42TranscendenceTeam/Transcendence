import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import AuthLayout from '../../components/layouts/AuthLayout';

function Login() {
  const { loginTestUser } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login:', { username, password });
  };

  return (
    <AuthLayout>
      <h1 className="auth-title">Transcendence</h1>
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
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }}>
          Sign In
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
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
        <button type="button" className="btn btn-secondary" style={{ width: '100%' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '20px', height: '20px', marginRight: '0.5rem' }}>
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
          </svg>
          Sign in with 42
        </button>
      </div>
    </AuthLayout>
  );
}

export default Login;