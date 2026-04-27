/**
 * Authentication context provider
 * Manages user authentication state across the application
 */

import { createContext, useState, useEffect } from 'react';

// Create the authentication context
export const AuthContext = createContext();

// AuthProvider wraps the application to provide authentication functionality
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // TODO: Validate token and fetch user
    }
    setLoading(false);
  }, []);

  // Handle user login
  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  // Handle user logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Provide auth state and methods to child components
  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};