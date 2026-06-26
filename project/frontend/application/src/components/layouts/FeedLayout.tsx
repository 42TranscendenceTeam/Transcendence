/**
 * Feed Layout Component
 *
 * Layout for the Feed page.
 * Includes BottomNav and quick-access navigation
 */

import { useContext, type ReactNode } from 'react';
import { AuthContext } from '../../context/AuthContext';
import RightSidebar from '../../utils/RightSidebar';

interface FeedLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  quickAccess?: ReactNode;
}

function FeedLayout({ children, header, quickAccess }: FeedLayoutProps) {
  const { user } = useContext(AuthContext);
  return (
    <div className="feed-layout flex min-h-screen flex-col xl:pr-[340px]">
      {quickAccess && <aside className="feed-quick-access">{quickAccess}</aside>}
      {header && <div className="feed-header-container w-full max-w-[620px] mx-auto">{header}</div>}
      <main className="feed-main flex flex-1 w-full max-w-[620px] mx-auto p-6 pb-14">
        {children}
      </main>
      {user && (
        <aside className="hidden xl:fixed xl:right-6 xl:top-20 xl:bottom-6 xl:z-[150] xl:block xl:w-[360px]">
          <RightSidebar />
        </aside>
      )}
    </div>
  );
}

export default FeedLayout;
