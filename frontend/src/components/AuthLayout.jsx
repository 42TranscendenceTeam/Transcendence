/**
 * AuthLayout component
 * Layout wrapper for authentication pages with gradient background
 */

import { Footer } from './Footer';

export function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex flex-col relative">
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        {children}
      </main>
      <Footer />
    </div>
  );
}