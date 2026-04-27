/**
 * PrivacyPolicy page component
 * Placeholder page for Privacy Policy
 */

import { Footer } from '../components/Footer';

export default function PrivacyPolicy() {
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
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="text-white/60">Last updated: {today}</p>
          
          <p className="text-white/80">This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service.</p>

          <div className="bg-white/10 rounded-lg p-4 space-y-2">
            <h2 className="text-xl font-bold">Collecting and Using Your Personal Data</h2>
            <p className="text-white/70">We collect personal information that You voluntarily provide to us when You register on the Website or when You participate in activities on the Website.</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4 space-y-2">
            <h2 className="text-xl font-bold">Use of Your Personal Data</h2>
            <p className="text-white/70">We may use Personal Data for purposes including: providing and maintaining the Service, to notify You about changes to our Service, and to provide customer support.</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4 space-y-2">
            <h2 className="text-xl font-bold">Retention of Your Personal Data</h2>
            <p className="text-white/70">We will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy.</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4 space-y-2">
            <h2 className="text-xl font-bold">Security of Your Personal Data</h2>
            <p className="text-white/70">The security of Your Personal Data is important to us, but remember that no method of transmission over the Internet is 100% secure.</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4 space-y-2">
            <h2 className="text-xl font-bold">Changes to This Privacy Policy</h2>
            <p className="text-white/70">We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}