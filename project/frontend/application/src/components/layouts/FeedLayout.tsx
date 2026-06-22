/**
 * Feed Layout Component
 *
 * Layout for the Feed page.
 * Includes BottomNav and quick-access navigation
 */

import type { ReactNode } from 'react';

interface FeedLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  quickAccess?: ReactNode;
}

function FeedLayout({ children, header, quickAccess }: FeedLayoutProps) {
  return (
    <div className="feed-layout min-h-screen flex flex-col pr-[340px]">
      {quickAccess && <aside className="feed-quick-access">{quickAccess}</aside>}
      {header && <div className="feed-header-container w-full max-w-[620px] mx-auto">{header}</div>}
      <main className="feed-main flex flex-1 w-full max-w-[620px] mx-auto p-6 pb-14">
        {children}
      </main>
    </div>
  );
}

export default FeedLayout;
