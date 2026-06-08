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
    <section className="legal-page">
      <h1 className="legal-title">{t('legal.privacy.title')}</h1>

      <div className="legal-content">
        <p>{t('legal.privacy.intro')}</p>

        <h2>{t('legal.privacy.infoCollect')}</h2>
        <p>{t('legal.privacy.infoCollectText')}</p>

        <h2>{t('legal.privacy.infoUse')}</h2>
        <p>{t('legal.privacy.infoUseText')}</p>

        <h2>{t('legal.privacy.dataProtection')}</h2>
        <p>{t('legal.privacy.dataProtectionText')}</p>

        <h2>{t('legal.privacy.contact')}</h2>
        <p>{t('legal.privacy.contactText')}</p>

        <p className="legal-contact-list">
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
      <div className="legal-layout-card">
        {pageContent}
      </div>
    </ProfileLayout>
  ) : (
    <AuthLayout>{pageContent}</AuthLayout>
  );
}

export default PrivacyPolicy;
