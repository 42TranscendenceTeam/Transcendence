/**
 * Privacy Policy Page Component
 * 
 * Displays the application's privacy policy.
 * Static content page.
 */

import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import AuthLayout from '../../components/layouts/AuthLayout';
import ProfileLayout from '../../components/layouts/ProfileLayout';

function PrivacyPolicy() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);

  const pageContent = (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 600 }}>{t('legal.privacy.title')}</h1>
        
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.7' }}>
          <p style={{ marginBottom: '1rem' }}>
            {t('legal.privacy.intro')}
          </p>
          
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>{t('legal.privacy.infoCollect')}</h2>
          <p style={{ marginBottom: '1rem' }}>
            {t('legal.privacy.infoCollectText')}
          </p>
          
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>{t('legal.privacy.infoUse')}</h2>
          <p style={{ marginBottom: '1rem' }}>
            {t('legal.privacy.infoUseText')}
          </p>
          
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>{t('legal.privacy.dataProtection')}</h2>
          <p style={{ marginBottom: '1rem' }}>
            {t('legal.privacy.dataProtectionText')}
          </p>
          
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>{t('legal.privacy.contact')}</h2>
          <p>
            {t('legal.privacy.contactText')}
          </p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
            nsimao-f@student.42porto.com<br/>
            diolivei@student.42porto.com<br/>
            tialbert@student.42porto.com<br/>
            vafernan@student.42porto.com
          </p>
        </div>
    </div>
  );

  if (user) {
    return (
      <ProfileLayout>
        {pageContent}
      </ProfileLayout>
    );
  }

  return (
    <AuthLayout>
      {pageContent}
    </AuthLayout>
  );
}

export default PrivacyPolicy;