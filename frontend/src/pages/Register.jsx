/**
 * Register page component
 * User registration page with username/password/email form
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({ username: '', password: '', confirmPassword: '', email: '' });

  const validate = () => {
    const newErrors = { username: '', password: '', confirmPassword: '', email: '' };
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return !newErrors.username && !newErrors.password && !newErrors.confirmPassword;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // TODO: implement backend api
    // const response = await fetch('/api/auth/register', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ username, password, email: email || null }),
    // });
    alert('Function not implemented yet. Please try again later.');
    window.location.href = '/';
  };

  return (
    <AuthLayout>
      <button
        onClick={() => window.history.back()}
        className="absolute top-4 left-4 text-white/60 hover:text-white"
      >
        ← Back
      </button>

      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/10">
          <h1 className="text-3xl font-bold text-white text-center mb-2">Create Account</h1>
          <p className="text-white/60 text-center mb-8">Join us and start collaborating</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={errors.username}
              placeholder="Choose a username"
              autoComplete="username"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              placeholder="Create a password"
              autoComplete="new-password"
            />

            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              placeholder="Confirm your password"
              autoComplete="new-password"
            />

            <Input
              label="Email (optional)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              placeholder="Enter your email"
              autoComplete="email"
            />

            <Button type="submit">
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-white/60">Already have an account? </span>
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Login
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}