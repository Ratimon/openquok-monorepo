import type { FeaturesGridRowConfig } from '$data/landing-features-grid-types';

/**
 * Home `/` icon grid layout (`IconTileGrid` `variant="home"` on `LandingPage.svelte`).
 *
 * **Where to configure**
 * - Row order and ids: this file (`FEATURES_GRID_HOME_ROWS`).
 * - Social tile icons/styles: `web/src/data/landing-social-platforms.ts` (`FEATURES_GRID_SOCIAL_PLATFORMS`).
 * - Directory tile icons (PeerPush, Uneed): `web/src/data/landing-directory-platforms.ts`.
 * - `/social-media-management` grid only: `FEATURES_GRID_SOCIAL_ROWS` in `landing-social-platforms.ts`.
 * - `/directory-submission-tool` grid only: `FEATURES_GRID_DIRECTORY_ROWS` in `landing-directory-platforms.ts`.
 *
 * 11 social + 2 directory tiles in a 4 + 5 + 4 stagger (PeerPush row 2, Uneed row 3).
 */
export const FEATURES_GRID_HOME_ROWS: FeaturesGridRowConfig[] = [
	{
		offsetClass: 'translate-x-4 sm:translate-x-6 md:translate-x-8',
		platformIds: ['threads', 'instagram-business', 'facebook', 'youtube']
	},
	{
		offsetClass: 'translate-x-0',
		platformIds: ['tiktok', 'linkedin', 'x', 'devto', 'peerpush']
	},
	{
		offsetClass: '-translate-x-4 sm:-translate-x-6 md:-translate-x-8',
		platformIds: ['bluesky', 'skool', 'instagram-standalone', 'uneed']
	}
];
