/** Secret-admin copy for link-directory site metrics (v1 manual; phase 2 automation deferred). */

export type LinkDirectoryAdminMetricsCopySection = {
	title: string;
	intro: string;
	v1Bullets: readonly string[];
	phase2DeferredTitle: string;
	phase2DeferredBody: string;
	phase2OperatorBullets: readonly string[];
	publicSiteNote: string;
};

export const LINK_DIRECTORY_ADMIN_METRICS_COPY: LinkDirectoryAdminMetricsCopySection = {
	title: 'Site metrics (manual in v1)',
	intro:
		'Domain rating, domain authority, and monthly visits on each site are editor-maintained estimates. Public cards show a last-updated date. There is no automated refresh job in this release.',
	v1Bullets: [
		'Enter DR, DA, and traffic on the site editor when you have numbers from your metrics subscription or internal research.',
		'Set metrics source to a short note (for example “Ahrefs export, March 2026”) so the next editor knows where values came from.',
		'Saving after you change a metric field stamps metrics updated at for the public directory.',
		'Do not use free bulk checkers or scraped third-party UIs — they are unreliable and often violate terms of service.'
	],
	phase2DeferredTitle: 'Deferred: automated refresh (not shipped)',
	phase2DeferredBody:
		'A later phase may add scheduled domain-level refreshes, snapshot history, stale-data badges, and backend configuration for a single paid metrics API. None of that runs today — no cron, no snapshot table, and no GlobalConfig keys for providers.',
	phase2OperatorBullets: [
		'Likely approach: one paid API for domain rating and traffic (for example Ahrefs or Semrush), optional Moz Links API only if you subscribe for domain authority.',
		'Storage sketch: upsert site columns and append historical rows; flag sites older than ~90 days without a refresh.',
		'Admin “Refresh metrics” and env wiring would ship with that phase, not before.'
	],
	publicSiteNote:
		'Public FAQ and cards describe estimates with a date stamp only — no vendor names on the marketing site.'
};
