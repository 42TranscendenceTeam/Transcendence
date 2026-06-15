/**
 * Not Found Page Component
 *
 * Displays a fallback page for unknown routes.
 */

import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../components/layouts/AuthLayout';
import ProfileLayout from '../components/layouts/ProfileLayout';

function NotFound() {
	const { user } = useContext(AuthContext);
	const { t } = useTranslation();

	const pageContent = (
		<section className="not-found-page">
			<h1 className="not-found-code">404</h1>
			<h2 className="not-found-title">{t('notFound.title')}</h2>
			<p className="not-found-text">{t('notFound.text')}</p>
			<Link to="/" className="btn btn-accent not-found-link"> {t('notFound.backHome')} </Link>
		</section>
	);
	return user ? (
		<ProfileLayout>
			<div className="legal-layout-card">
				{pageContent}
			</div>
		</ProfileLayout>
	) : (
		<AuthLayout>
			{pageContent}
		</AuthLayout>
	);
}

export default NotFound;
