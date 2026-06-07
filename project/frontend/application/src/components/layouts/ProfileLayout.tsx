/**
 * Profile Layout Component
 *
 * Layout for profile pages (Profile, Teams, Friends, etc.)
 * Includes navigation and user info
 */

import { Link, useLocation } from 'react-router-dom';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import BottomNav from './BottomNav';
import type { ReactNode } from 'react';

interface ProfileLayoutProps {
  children: ReactNode;
}

function ProfileLayout({ children }: ProfileLayoutProps) {
  const { t } = useTranslation();
  const { logout, user, unreadCount } = useContext(AuthContext);
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { path: '/', label: t('nav.feed'), icon: 'M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69zM12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.135-.847 2.1-1.96 2.193-1.104.093-2.07-.512-2.187-1.384l-.338-2.592c-.034-.266-.198-.511-.468-.68l-1.968-.787a2.25 2.25 0 00-2.226.162L5.409 17.75c-.524.21-1.103.145-1.468-.2l-.985-1.18a2.25 2.25 0 00-.468-.68l-.338-2.592c-.117-.93.092-1.786.602-2.358a2.25 2.25 0 011.96-1.193h6.198c1.11 0 2.063.643 2.17 1.746l.21 1.272c.117.93-.092 1.786-.602 2.358a2.25 2.25 0 01-1.96 1.193l-1.968.787c-.524.21-1.103.145-1.468.2l-.985 1.18c-.365.434-.6.99-.6 1.604v6.198c0 1.135-.847 2.1-1.96 2.193-1.104.093-2.07-.512-2.187-1.384l-.338-2.592c-.034-.266-.198-.511-.468-.68l-1.968-.787a2.25 2.25 0 00-2.226.162L3.409 19c-.524.21-1.103.145-1.468-.2l-.985-1.18a2.25 2.25 0 00-.468-.68l.82-1.22c.298.215.653.337 1.03.337.378 0 .733-.122 1.03-.337l.985 1.18c.365-.345.945-.51 1.468-.2l1.968.787c.27.169.434.414.468.68l.338 2.592c.117.93-.092 1.786-.602 2.358a2.25 2.25 0 01-1.96 1.193H7.193c-1.11 0-2.063-.643-2.17-1.746l-.21-1.272c-.117-.93.092-1.786.602-2.358a2.25 2.25 0 011.96-1.193h1.5' },
    { path: '/profile', label: t('nav.profile'), icon: 'M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.895A15.309 15.309 0 0112 21c-2.17 0-4.207-.316-6.061-1.777a.75.75 0 01-.437-.895z' },
    { path: '/profile/friends', label: t('nav.friends'), icon: 'M12 11c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm-6 8c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z' },
    { path: '/profile/teams', label: t('nav.teams'), icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
    { path: '/profile/notifications', label: t('nav.notifications'), icon: 'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0' },
  ];

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    logout();
    window.location.href = '/';
  };

  return (
    <div className={`profile-layout ${user ? 'has-sidebar' : 'no-sidebar'}`}>
      {user && (
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open navigation menu"
        >
          ☰
        </button>
      )}
      {user && (
        <div className="profile-top-actions">
          <Link
            to="/profile/notifications"
            className={`top-notification-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
            aria-label={t('nav.notifications')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22ZM18 16v-5a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2Z" />
            </svg>

            {unreadCount > 0 && <span className="top-notification-dot" />}
          </Link>
          <Link to="/profile" className="top-profile-link">
            <img src={user.avatar} />
            <span className="top-profile-status" />
          </Link>
        </div>
      )}
      <main className={`profile-main ${location.pathname === '/' ? 'profile-main-feed' : ''}`}>{children}</main>
      {user && (
        <aside className="profile-sidebar">
          <Link to="/" className="sidebar-logo-link" aria-label="Go to feed">
            <img className="sidebar-logo-img" src="/sidebar-logo.png" alt="transcendence" />
          </Link>
          <nav className="profile-sidebar-nav">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`profile-sidebar-nav-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                <div className="nav-icon-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="nav-icon">
                    <path fillRule="evenodd" d={item.icon} clipRule="evenodd" />
                  </svg>
                  {item.path === '/profile/notifications' && unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  )}
                </div>
                <span>{item.label}</span>
              </Link>
            ))}
            <button onClick={handleLogout} className="profile-sidebar-nav-item logout-btn">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="nav-icon">
                <path fillRule="evenodd" d="M7.5 3.75A2.75 2.75 0 005.75 6.5v11A2.75 2.75 0 008.5 20.25h7a.75.75 0 010 1.5h-7a4.25 4.25 0 01-4.25-4.25v-11A4.25 4.25 0 015.75 1h7a.75.75 0 010 1.5h-7zm9.22.22a.75.75 0 011.06 0l2.25 2.25a.75.75 0 010 1.06l-2.25 2.25a.75.75 0 11-1.06-1.06l.97-.97H8.5a.75.75 0 010-1.5h10.69l-.97-.97a.75.75 0 010-1.06z" clipRule="evenodd" />
              </svg>
              <span>{t('auth.logout')}</span>
            </button>
          </nav>
          <BottomNav />
        </aside>
      )}
      {user && isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-menu-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <span>Menu</span>
              <button
                className="mobile-menu-close"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close navigation menu"
              >
                ×
              </button>
            </div>
            <nav className="mobile-menu-nav">
              {menuItems.map((item) => (
                item.path === '#' ? (
                  <button
                    key={item.path}
                    onClick={(e) => {
                      handleNotificationsClick(e);
                      setIsMobileMenuOpen(false);
                    }}
                    className="mobile-menu-nav-item"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mobile-menu-icon">
                      <path fillRule="evenodd" d={item.icon} clipRule="evenodd" />
                    </svg>
                    <span>{item.label}</span>
                  </button>
                ) : (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`mobile-menu-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mobile-menu-icon">
                      <path fillRule="evenodd" d={item.icon} clipRule="evenodd" />
                    </svg>
                    <span>{item.label}</span>
                  </Link>
                )
              ))}
              <button onClick={handleLogout} className="mobile-menu-nav-item logout-btn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mobile-menu-icon">
                  <path fillRule="evenodd" d="M7.5 3.75A2.75 2.75 0 005.75 6.5v11A2.75 2.75 0 008.5 20.25h7a.75.75 0 010 1.5h-7a4.25 4.25 0 01-4.25-4.25v-11A4.25 4.25 0 015.75 1h7a.75.75 0 010 1.5h-7zm9.22.22a.75.75 0 011.06 0l2.25 2.25a.75.75 0 010 1.06l-2.25 2.25a.75.75 0 11-1.06-1.06l.97-.97H8.5a.75.75 0 010-1.5h10.69l-.97-.97a.75.75 0 010-1.06z" clipRule="evenodd" />
                </svg>
                <span>{t('auth.logout')}</span>
              </button>
              <div className="mobile-menu-legal-links">
                <Link
                  to="/privacy"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`mobile-menu-nav-item mobile-menu-legal-item ${location.pathname === '/privacy' ? 'active' : ''}`}
                >
                  <span>{t('legal.privacy.title')}</span>
                </Link>

                <Link
                  to="/terms"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`mobile-menu-nav-item mobile-menu-legal-item ${location.pathname === '/terms' ? 'active' : ''}`}
                >
                  <span>{t('legal.terms.title')}</span>
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileLayout;
