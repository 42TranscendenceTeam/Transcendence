import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/layouts/AuthLayout';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // TODO: Send POST /api/auth/register with {username, email, password}, receive {token, user}
  // TODO: Remove dummy fields - validate with backend (email unique, username available)
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Registration is not yet implemented. Please use the 42 login option.');
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
            placeholder="Choose a username"
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label className="label" htmlFor="email">Email (optional)</label>
          <input
            type="email"
            id="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label className="label" htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
          />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="label" htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            className="input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }}>
          Register
        </button>
        <div style={{ textAlign: 'center' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
          <Link to="/login" style={{ color: 'var(--accent)' }}>Sign in</Link>
        </div>
      </form>
    </AuthLayout>
  );
}

export default Register;