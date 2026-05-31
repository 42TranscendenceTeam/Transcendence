/**
 * Auth Layout Component
 *
 * Layout for authentication pages (Login, Register, etc.)
 * Includes BottomNav and BackButton
 */

import type { ReactNode } from 'react';
import BottomNav from './BottomNav';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: ReactNode;
}

function AuthLayout({ children }: AuthLayoutProps) {
	return (
		<div className="auth-layout">
			<header className="auth-topbar">
				<Link to="/" className="auth-topbar-logo">
					<img src="/sidebar-logo.png" alt="Transcendence" />
				</Link>

				<div className="auth-topbar-actions">
					<span>New to Transcendence?</span>
					<Link to="/register" className="auth-topbar-btn">
						Create account
					</Link>
				</div>
			</header>

			<main className="auth-content">
				<div className="auth-card">
					{children}
				</div>
			</main>
		</div>
	);
}

export default AuthLayout;
