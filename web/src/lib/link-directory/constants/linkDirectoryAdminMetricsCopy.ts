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
	title: 'Site metrics',
	intro:
		'Domain rating on catalog sites can be refreshed from DataForSEO (secret-admin Sites → Refresh catalog DR, or the backend script). Domain authority and monthly visits stay editor-maintained until a traffic provider is wired.',
	v1Bullets: [
		'Use Refresh catalog DR on the Sites list to update published sites from each site URL hostname (respects the global snapshot cache unless you pass --force in the script).',
		'CLI: pnpm --filter ./backend run script:refresh-link-directory-catalog-dr (add --force, --published-only, --slug=…). Requires DATAFORSEO_API_KEY on the API.',
		'Enter DA and traffic manually on the site editor when you have numbers from your metrics subscription or internal research.',
		'Saving after you change a manual metric field stamps metrics updated at for the public directory.'
	],
	phase2DeferredTitle: 'Deferred: DA, traffic, and scheduled catalog refresh',
	phase2DeferredBody:
		'Automated monthly visits and domain authority from additional providers, plus a housekeeping cron for catalog DR only, are not shipped yet. Directory analytics for customer domains uses the same DataForSEO cache with its own workspace UI.',
	phase2OperatorBullets: [
		'Optional: extend the catalog refresh worker to run on the housekeeping timer (today it is on-demand only).',
		'Traffic and DA may need separate paid APIs; keep metrics source notes on manual fields.',
		'Stale-data badges on the public hub remain a future UX improvement.'
	],
	publicSiteNote:
		'Public FAQ and cards describe estimates with a date stamp only — no vendor names on the marketing site.'
};
