import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Feed from './pages/feed/Feed';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import PrivacyPolicy from './pages/auth/PrivacyPolicy';
import TermsOfService from './pages/auth/TermsOfService';
import ProfileLayout from './components/layouts/ProfileLayout';
import Profile from './pages/profile/Profile';
import ProfileEdit from './pages/profile/ProfileEdit';
import Friends from './pages/profile/Friends';
import Teams from './pages/profile/Teams';
import Security from './pages/profile/Security';
import TeamDetail from './pages/profile/TeamDetail';

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login';
    }
  }, [user, loading]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
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
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;