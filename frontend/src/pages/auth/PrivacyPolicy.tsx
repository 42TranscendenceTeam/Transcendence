import AuthLayout from '../../components/layouts/AuthLayout';

function PrivacyPolicy() {
  return (
    <AuthLayout>
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 600 }}>Privacy Policy</h1>
        
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.7' }}>
          <p style={{ marginBottom: '1rem' }}>
            At Transcendence, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information.
          </p>
          
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Information We Collect</h2>
          <p style={{ marginBottom: '1rem' }}>
            We collect information you provide directly to us, including your username, email address, and profile information when you create an account.
          </p>
          
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>How We Use Your Information</h2>
          <p style={{ marginBottom: '1rem' }}>
            We use the information we collect to provide, maintain, and improve our services, including authenticating your account and personalizing your experience.
          </p>
          
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Data Protection</h2>
          <p style={{ marginBottom: '1rem' }}>
            We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>
          
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us through the app.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}

export default PrivacyPolicy;