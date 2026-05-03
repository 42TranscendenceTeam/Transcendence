import type { ReactNode } from 'react';
import BottomNav from './BottomNav';

interface FeedLayoutProps {
  children: ReactNode;
}

function FeedLayout({ children }: FeedLayoutProps) {
  return (
    <div className="feed-layout">
      <main className="feed-main">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

export default FeedLayout;