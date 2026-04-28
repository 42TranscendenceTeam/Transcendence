import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

function BottomNav() {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (user) {
    return (
      <nav className="bottom-nav">
        <Link to="/privacy" className={`bottom-nav-item ${location.pathname === '/privacy' ? 'active' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="nav-icon">
            <path fillRule="evenodd" d="M12 22a10 10 0 100-20 10 10 0 000 20zm-1-8.75v-2.5a.75.75 0 011.5 0v1.5c0 .414.336.75.75.75h1.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75zm1-3.25a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <span>Privacy</span>
        </Link>
        <Link to="/terms" className={`bottom-nav-item ${location.pathname === '/terms' ? 'active' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="nav-icon">
            <path fillRule="evenodd" d="M4.5 3.75a.75.75 0 01.75-.75h13.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75zm0 8.25a.75.75 0 01.75-.75h13.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75zm0 8.25a.75.75 0 01.75-.75h13.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75z" clipRule="evenodd" />
          </svg>
          <span>Terms</span>
        </Link>
        <Link to="/profile" className={`bottom-nav-item ${location.pathname.startsWith('/profile') ? 'active' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="nav-icon">
            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.895A15.309 15.309 0 0112 21c-2.17 0-4.207-.316-6.061-1.777a.75.75 0 01-.437-.895z" clipRule="evenodd" />
          </svg>
          <span>Profile</span>
        </Link>
      </nav>
    );
  }

  return (
    <nav className="bottom-nav">
      <Link to="/privacy" className={`bottom-nav-item ${location.pathname === '/privacy' ? 'active' : ''}`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="nav-icon">
          <path fillRule="evenodd" d="M12 22a10 10 0 100-20 10 10 0 000 20zm-1-8.75v-2.5a.75.75 0 011.5 0v1.5c0 .414.336.75.75.75h1.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75zm1-3.25a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
        <span>Privacy</span>
      </Link>
      <Link to="/terms" className={`bottom-nav-item ${location.pathname === '/terms' ? 'active' : ''}`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="nav-icon">
          <path fillRule="evenodd" d="M4.5 3.75a.75.75 0 01.75-.75h13.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75zm0 8.25a.75.75 0 01.75-.75h13.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75zm0 8.25a.75.75 0 01.75-.75h13.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75z" clipRule="evenodd" />
        </svg>
        <span>Terms</span>
      </Link>
      <Link to="/login" className={`bottom-nav-item ${location.pathname === '/login' ? 'active' : ''}`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="nav-icon">
          <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.895A15.309 15.309 0 0112 21c-2.17 0-4.207-.316-6.061-1.777a.75.75 0 01-.437-.895z" clipRule="evenodd" />
        </svg>
        <span>Login</span>
      </Link>
    </nav>
  );
}

export default BottomNav;