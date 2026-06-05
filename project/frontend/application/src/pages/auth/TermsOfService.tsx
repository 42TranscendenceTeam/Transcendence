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
    <section className="legal-page">
      <h1 className="legal-title">{t('legal.terms.title')}</h1>

      <div className="legal-content">
        <p>{t('legal.terms.intro')}</p>

        <h2>{t('legal.terms.acceptableUse')}</h2>
        <p>{t('legal.terms.acceptableUseText')}</p>

        <h2>{t('legal.terms.accountResponsibilities')}</h2>
        <p>{t('legal.terms.accountResponsibilitiesText')}</p>

        <h2>{t('legal.terms.intellectualProperty')}</h2>
        <p>{t('legal.terms.intellectualPropertyText')}</p>

        <h2>{t('legal.terms.limitationLiability')}</h2>
        <p>{t('legal.terms.limitationLiabilityText')}</p>

        <h2>{t('legal.terms.changesToTerms')}</h2>
        <p>{t('legal.terms.changesToTermsText')}</p>
      </div>
    </section>
  );

  return user ? (
    <ProfileLayout>
      <div className="legal-layout-card">
        {pageContent}
      </div>
    </ProfileLayout>
  ) : (
    <AuthLayout>{pageContent}</AuthLayout>
  );
}

export default TermsOfService;
