/**
 * Terms of Service Page Component
 * 
 * Displays the application's terms of service.
 * Static content page.
 */

import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import AuthLayout from '../../components/layouts/AuthLayout';
import ProfileLayout from '../../components/layouts/ProfileLayout';

function TermsOfService() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);

  const pageContent = (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 600 }}>{t('legal.terms.title')}</h1>
        
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.7' }}>
          <p style={{ marginBottom: '1rem' }}>
            {t('legal.terms.intro')}
          </p>
          
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>{t('legal.terms.acceptableUse')}</h2>
          <p style={{ marginBottom: '1rem' }}>
            {t('legal.terms.acceptableUseText')}
          </p>
          
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>{t('legal.terms.accountResponsibilities')}</h2>
          <p style={{ marginBottom: '1rem' }}>
            {t('legal.terms.accountResponsibilitiesText')}
          </p>
          
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>{t('legal.terms.intellectualProperty')}</h2>
          <p style={{ marginBottom: '1rem' }}>
            {t('legal.terms.intellectualPropertyText')}
          </p>
          
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>{t('legal.terms.limitationLiability')}</h2>
          <p style={{ marginBottom: '1rem' }}>
            {t('legal.terms.limitationLiabilityText')}
          </p>
          
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>{t('legal.terms.changesToTerms')}</h2>
          <p>
            {t('legal.terms.changesToTermsText')}
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

export default TermsOfService;