import BottomNav from './BottomNav';

function FeedLayout({ children }) {
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