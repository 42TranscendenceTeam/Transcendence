/**
 * Auth Layout Component
 *
 * Layout for authentication pages (Login, Register, etc.)
 */

import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: ReactNode;
}

function AuthLayout({ children }: AuthLayoutProps) {
	return (
		<div className="auth-layout min-h-screen overflow-y-auto overflow-x-hidden flex flex-col items-stretch justify-start">
			<header className="auth-topbar w-full h-[72px] px-8 relative flex items-center justify-between">
				<Link to="/" className="auth-topbar-logo">
					<img src="/sidebar-logo.png" alt="Transcendence" />
				</Link>

				<div className="auth-topbar-actions flex items-center gap-4">
					<span>New to Transcendence?</span>
					<Link to="/register" className="auth-topbar-btn inline-flex h-10 px-6 items-center justify-center">
						Create account
					</Link>
				</div>
			</header>

			<main className="auth-content w-full min-h-[calc(100vh-72px)] flex items-center justify-center px-8 pb-8">
				<div className="auth-card min-w-[450px] p-6 flex flex-col">
					{children}
				</div>
			</main>
		</div>
	);
}

export default AuthLayout;
