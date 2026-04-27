/**
 * Footer component
 * Fixed footer with Privacy Policy and Terms of Service links
 */

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 py-4 text-center text-white/50 text-sm bg-black/20">
      <div className="flex justify-center gap-6">
        <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
        <span>|</span>
        <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
      </div>
    </footer>
  );
}