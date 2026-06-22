/**
 * Right Sidebar
 */

import { useTranslation } from 'react-i18next';

function RightSidebar() {

	const { t } = useTranslation();
	return (
		<div className="images-sidebar flex h-full w-full flex-col overflow-hidden rounded-2xl p-6">
			<div className="flex min-h-0 h-full flex-col gap-2">
				<img
					src="/team-illustration.jpg"
					alt="Team collaboration"
					className="w-full max-h-[28vh] shrink-0 rounded-xl object-contain"
				/>

				<div className="shrink-0">
					<h2 className="text-2xl font-bold leading-tight">
						{t('feed.collaborationTitleStart')}{' '}
						<span className="text-[var(--accent)]">
							{t('feed.collaborationTitleAccent')}
						</span>
					</h2>

					<p className="mt-1 max-w-[280px] text-base leading-snug text-[var(--text-secondary)]">
						{t('feed.collaborationDescription')}
					</p>
				</div>
				<div className="min-h-0 flex-1">
					<img
						src="/team-network.png"
						alt="Team network"
						className="mx-auto h-full w-[80%] rounded-xl object-contain"
					/>
				</div>
			</div>
		</div>
	);
}

export default RightSidebar;
