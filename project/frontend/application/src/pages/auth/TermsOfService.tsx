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
  const { user } = useContext(AuthContext);
  const { t } = useTranslation(undefined, { lng: user ? undefined : 'en' });

  const pageContent = (
    <section className="legal-page mx-auto rounded-xl">
      <h1 className="legal-title mb-4 text-center">{t('legal.terms.title')}</h1>

      <div className="legal-content text-text-secondary text-sm leading-relaxed">
        <p className="mb-2">{t('legal.terms.intro')}</p>

        <h2 className="mt-4 text-text-primary font-semibold">{t('legal.terms.acceptableUse')}</h2>
        <p className="mb-2">{t('legal.terms.acceptableUseText')}</p>

        <h2 className="mt-4 text-text-primary font-semibold">{t('legal.terms.accountResponsibilities')}</h2>
        <p className="mb-2">{t('legal.terms.accountResponsibilitiesText')}</p>

        <h2 className="mt-4 text-text-primary font-semibold">{t('legal.terms.intellectualProperty')}</h2>
        <p className="mb-2">{t('legal.terms.intellectualPropertyText')}</p>

        <h2 className="mt-4 text-text-primary font-semibold">{t('legal.terms.limitationLiability')}</h2>
        <p className="mb-2">{t('legal.terms.limitationLiabilityText')}</p>

        <h2 className="mt-4 text-text-primary font-semibold">{t('legal.terms.changesToTerms')}</h2>
        <p className="mb-2">{t('legal.terms.changesToTermsText')}</p>
      </div>
    </section>
  );

  return user ? (
    <ProfileLayout>
      <div className="legal-layout-card w-full max-w-2xl mx-auto p-6 md:p-8">
        {pageContent}
      </div>
    </ProfileLayout>
  ) : (
    <AuthLayout>{pageContent}</AuthLayout>
  );
}

export default TermsOfService;
