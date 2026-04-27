/**
 * TermsOfService page component
 * Placeholder page for Terms of Service
 */

import { Footer } from '../components/Footer';

export default function TermsOfService() {
  const today = new Date().toLocaleDateString();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex flex-col">
      <header className="p-4">
        <button
          onClick={() => window.history.back()}
          className="text-white/60 hover:text-white"
        >
          ← Back
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 py-8 overflow-auto">
        <div className="w-full max-w-2xl text-white space-y-6">
          <h1 className="text-3xl font-bold">Terms of Service</h1>
          <p className="text-white/60">Last updated: {today}</p>
          
          <p className="text-white/80">Welcome to our platform. By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement.</p>

          <div className="bg-white/10 rounded-lg p-4 space-y-2">
            <h2 className="text-xl font-bold">Acceptance of Terms</h2>
            <p className="text-white/70">By using this service, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4 space-y-2">
            <h2 className="text-xl font-bold">Use of Service</h2>
            <p className="text-white/70">You agree to use this service only for lawful purposes and in accordance with these Terms of Service.</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4 space-y-2">
            <h2 className="text-xl font-bold">Account Responsibilities</h2>
            <p className="text-white/70">You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4 space-y-2">
            <h2 className="text-xl font-bold">Limitation of Liability</h2>
            <p className="text-white/70">The service is provided "as is" without any warranties, expressed or implied.</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4 space-y-2">
            <h2 className="text-xl font-bold">Changes to Terms</h2>
            <p className="text-white/70">We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of any changes.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}