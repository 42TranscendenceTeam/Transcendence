/**
 * Bottom Navigation Component
 * 
 * Mobile-friendly bottom navigation bar.
 * Shows different links based on auth state.
 */

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
    </nav>
  );
}

export default BottomNav;