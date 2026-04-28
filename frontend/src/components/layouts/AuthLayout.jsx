import BottomNav from './BottomNav';
import BackButton from '../BackButton';

function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      <BackButton />
      <div className="auth-card" style={{ marginTop: '3rem' }}>
        {children}
      </div>
      <BottomNav />
    </div>
  );
}

export default AuthLayout;