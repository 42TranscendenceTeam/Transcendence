import AuthLayout from '../../components/layouts/AuthLayout';

function TermsOfService() {
  return (
    <AuthLayout>
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 600 }}>Terms of Service</h1>
        
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.7' }}>
          <p style={{ marginBottom: '1rem' }}>
            By using Transcendence, you agree to these Terms of Service. Please read them carefully before using our service.
          </p>
          
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Acceptable Use</h2>
          <p style={{ marginBottom: '1rem' }}>
            You agree to use the service in accordance with all applicable laws and regulations. You will not engage in any activity that interferes with or disrupts the service.
          </p>
          
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Account Responsibilities</h2>
          <p style={{ marginBottom: '1rem' }}>
            You are responsible for maintaining the security of your account and for all activities that occur under your account.
          </p>
          
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Intellectual Property</h2>
          <p style={{ marginBottom: '1rem' }}>
            The service and its content are protected by copyright and other intellectual property rights. You may not copy, modify, or distribute our content without our permission.
          </p>
          
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Limitation of Liability</h2>
          <p style={{ marginBottom: '1rem' }}>
            The service is provided "as is" without any warranties. We will not be liable for any damages arising from your use of the service.
          </p>
          
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Your continued use of the service constitutes acceptance of any changes.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}

export default TermsOfService;