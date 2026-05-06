/**
 * Auth Layout Component
 * 
 * Layout for authentication pages (Login, Register, etc.)
 * Includes BottomNav and BackButton
 */

import type { ReactNode } from 'react';
import BottomNav from './BottomNav';
import BackButton from '../BackButton';

interface AuthLayoutProps {
  children: ReactNode;
}

function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-layout">
      <BackButton />
      <div className="auth-card" style={{ marginTop: '3rem' }}>
        {children}
      </div>
      <BottomNav />
    </div>
  );
}

export default AuthLayout;