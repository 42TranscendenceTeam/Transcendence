/**
 * Main Application Router
 *
 * Defines all application routes using React Router.
 * Sets up authentication context and routes.
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext, useEffect, ReactNode } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ErrorProvider } from './context/ErrorContext';
import Feed from './pages/feed/Feed';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import PrivacyPolicy from './pages/auth/PrivacyPolicy';
import TermsOfService from './pages/auth/TermsOfService';
import ProfileLayout from './components/layouts/ProfileLayout';
import Profile from './pages/profile/Profile';
import UserProfile from './pages/profile/UserProfile';
import ProfileEdit from './pages/profile/ProfileEdit';
import Friends from './pages/profile/Friends';
import FriendChat from './pages/profile/FriendChat';
import Teams from './pages/profile/Teams';
import Notifications from './pages/profile/Notifications';
import Security from './pages/profile/Security';
import TeamDetail from './pages/profile/TeamDetail';
import NotFound from './pages/404';

interface ProtectedRouteProps {
  children: ReactNode;
}

/*
 * ProtectedRoute method will ensure only authenticated users can access certain routes.
*/
function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider> {/* Provides authentication context to the entire app. */}
      <ErrorProvider>
      <Router> {/* Enables navigation, /login, /profile, etc. */}
        <Routes> {/* Container for all routes. */}
          <Route
            path="/"
            element={
              <ProfileLayout>
                <Feed />
              </ProfileLayout>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileLayout>
                  <Profile />
                </ProfileLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:userId"
            element={
              <ProtectedRoute>
                <ProfileLayout>
                  <UserProfile />
                </ProfileLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <ProfileLayout>
                  <ProfileEdit />
                </ProfileLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/friends"
            element={
              <ProtectedRoute>
                <ProfileLayout>
                  <Friends />
                </ProfileLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/friends/:id"
            element={
              <ProtectedRoute>
                <ProfileLayout>
                  <FriendChat />
                </ProfileLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/teams"
            element={
              <ProtectedRoute>
                <ProfileLayout>
                  <Teams />
                </ProfileLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teams/:id"
            element={
              <ProtectedRoute>
                <ProfileLayout>
                  <TeamDetail />
                </ProfileLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/security"
            element={
              <ProtectedRoute>
                <ProfileLayout>
                  <Security />
                </ProfileLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/notifications"
            element={
              <ProtectedRoute>
                <ProfileLayout>
                  <Notifications />
                </ProfileLayout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      </ErrorProvider>
    </AuthProvider>
  );
}

export default App;
