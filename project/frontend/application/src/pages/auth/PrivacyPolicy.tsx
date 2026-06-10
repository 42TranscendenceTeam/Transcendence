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
  const { user } = useContext(AuthContext);
  const { t } = useTranslation(undefined, { lng: user ? undefined : 'en' });

  const pageContent = (
    <section className="legal-page mx-auto rounded-xl">
      <h1 className="legal-title mb-4 text-center">{t('legal.privacy.title')}</h1>

      <div className="legal-content text-sm text-text-secondary leading-relaxed">
        <p className="mb-2">{t('legal.privacy.intro')}</p>

        <h2 className="mt-4 text-text-primary font-semibold">{t('legal.privacy.infoCollect')}</h2>
        <p className="mb-2">{t('legal.privacy.infoCollectText')}</p>

        <h2 className="mt-4 text-text-primary font-semibold">{t('legal.privacy.infoUse')}</h2>
        <p className="mb-2">{t('legal.privacy.infoUseText')}</p>

        <h2 className="mt-4 text-text-primary font-semibold">{t('legal.privacy.dataProtection')}</h2>
        <p className="mb-2">{t('legal.privacy.dataProtectionText')}</p>

        <h2 className="mt-4 text-text-primary font-semibold">{t('legal.privacy.contact')}</h2>
        <p className="mb-2">{t('legal.privacy.contactText')}</p>

        <p className="legal-contact-list mt-2 text-xs text-text-secondary">
          nsimao-f@student.42porto.com<br />
          diolivei@student.42porto.com<br />
          tialbert@student.42porto.com<br />
          vafernan@student.42porto.com
        </p>
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

export default PrivacyPolicy;
