import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import BackButton from '../BackButton';
import BottomNav from './BottomNav';

function ProfileLayout({ children }) {
  const { logout } = useContext(AuthContext);
  const location = useLocation();

const menuItems = [
    { path: '/profile', label: 'Profile', icon: 'M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.895A15.309 15.309 0 0112 21c-2.17 0-4.207-.316-6.061-1.777a.75.75 0 01-.437-.895z' },
    { path: '/profile/edit', label: 'Edit', icon: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 000-1.41l-2.34-2.34a.996.996 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83 1.83z' },
    { path: '/profile/friends', label: 'Friends', icon: 'M12 11c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm-6 8c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z' },
    { path: '/profile/teams', label: 'Teams', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
    { path: '/profile/security', label: 'Security', icon: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z' },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="profile-layout">
      <BackButton />
      <main className="profile-main">{children}</main>
      <aside className="profile-sidebar">
        <nav className="profile-sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`profile-sidebar-nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="nav-icon">
                <path fillRule="evenodd" d={item.icon} clipRule="evenodd" />
              </svg>
              <span>{item.label}</span>
            </Link>
          ))}
          <button onClick={handleLogout} className="profile-sidebar-nav-item logout-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="nav-icon">
              <path fillRule="evenodd" d="M7.5 3.75A2.75 2.75 0 005.75 6.5v11A2.75 2.75 0 008.5 20.25h7a.75.75 0 010 1.5h-7a4.25 4.25 0 01-4.25-4.25v-11A4.25 4.25 0 015.75 1h7a.75.75 0 010 1.5h-7zm9.22.22a.75.75 0 011.06 0l2.25 2.25a.75.75 0 010 1.06l-2.25 2.25a.75.75 0 11-1.06-1.06l.97-.97H8.5a.75.75 0 010-1.5h10.69l-.97-.97a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
            <span>Logout</span>
          </button>
        </nav>
      </aside>
      <BottomNav />
    </div>
  );
}

export default ProfileLayout;