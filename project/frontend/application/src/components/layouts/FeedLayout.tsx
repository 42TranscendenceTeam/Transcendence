/**
 * Feed Layout Component
 *
 * Layout for the Feed page.
 * Includes BottomNav, GlobalChat, and quick-access navigation
 */

import { useContext } from 'react';
import type { ReactNode } from 'react';
import GlobalChat from '../chat/GlobalChat';
import { AuthContext } from '../../context/AuthContext';

interface FeedLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  quickAccess?: ReactNode;
}

function FeedLayout({ children, header, quickAccess }: FeedLayoutProps) {
  const { user } = useContext(AuthContext);

  return (
    <div className="feed-layout">
      {quickAccess && <aside className="feed-quick-access">{quickAccess}</aside>}
      {header && <div className="feed-header-container">{header}</div>}
      <main className="feed-main">
        {children}
      </main>
      {user && (
        <aside className="feed-sidebar">
          <GlobalChat />
        </aside>
      )}
    </div>
  );
}

export default FeedLayout;
