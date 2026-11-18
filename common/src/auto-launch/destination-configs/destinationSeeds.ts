/**
 * Source of truth for `auto_launch_destinations` row seeds (502–506 SQL).
 * Consumed by `backend/scripts/sync-auto-launch-destination-seeds.mjs`.
 *
 * Next stable destination id suffix after TinyLaunch: …010
 */

export type AutoLaunchDestinationSeedGenerationMode = 'full' | 'composite';

export type AutoLaunchDestinationSeedRow = {
	/** Stable UUID for `auto_launch_destinations.id` (tier …0030-4000-a000-…). */
	destinationId: string;
	providerSlug: string;
	siteSlug: string;
	name: string;
	shortDescription: string;
	startUrl: string;
	sortOrder: number;
	pickerGroupKey: string | null;
	pickerGroupTitle: string | null;
	submissionPath?: 'extension';
} & (
	| { opportunitySlug: string; opportunitySlugPriority?: undefined; opportunitySlugInList?: undefined }
	| {
			opportunitySlug?: undefined;
			opportunitySlugPriority: readonly string[];
			/** Optional `IN (...)` slug order (defaults to `opportunitySlugPriority`). */
			opportunitySlugInList?: readonly string[];
			/** Multi-line `IN (` formatting (Uneed join-the-line row). */
			opportunitySlugInMultiline?: boolean;
	  }
);

export type AutoLaunchDestinationSeedModule = {
	/** Site key for `--site` filtering (matches `link_directory_sites.slug` when applicable). */
	siteKey: string;
	sqlFileName: string;
	generationMode: AutoLaunchDestinationSeedGenerationMode;
	moduleDate: string;
	moduleScopeLabel: string;
	/** Extra `--` comment lines after the standard extension_config note. */
	preambleComments: readonly string[];
	destinations: readonly AutoLaunchDestinationSeedRow[];
};

const UNEED_DESTINATIONS: readonly AutoLaunchDestinationSeedRow[] = [
	{
		destinationId: 'd5f7d000-0030-4000-a000-000000000001',
		providerSlug: 'uneed-join-line',
		siteSlug: 'uneed',
		name: 'Uneed — Join the line',
		shortDescription:
			'Free product queue on Uneed; extension fills the listing form on Your tools.',
		startUrl: 'https://www.uneed.best/your-tools',
		sortOrder: 10,
		pickerGroupKey: 'uneed-product-listing',
		pickerGroupTitle: 'Product listing',
		opportunitySlugPriority: [
			'free-launch-join-the-line-',
			'free-launch-join-the-line',
			'free-launch',
		],
		opportunitySlugInMultiline: true,
	},
	{
		destinationId: 'd5f7d000-0030-4000-a000-000000000002',
		providerSlug: 'uneed-paid-launch',
		siteSlug: 'uneed',
		name: 'Uneed — Paid launch',
		shortDescription:
			'Skip the line, fast-track, or relaunch tiers; same listing fields as the free queue.',
		startUrl: 'https://www.uneed.best/your-tools',
		sortOrder: 20,
		pickerGroupKey: 'uneed-product-listing',
		pickerGroupTitle: 'Product listing',
		opportunitySlug: 'paid-launch',
	},
	{
		destinationId: 'd5f7d000-0030-4000-a000-000000000003',
		providerSlug: 'uneed-maker-profile',
		siteSlug: 'uneed',
		name: 'Uneed — Maker profile',
		shortDescription: 'Free maker profile with a website field (typically nofollow).',
		startUrl: 'https://uneed.best/',
		sortOrder: 30,
		pickerGroupKey: null,
		pickerGroupTitle: null,
		opportunitySlugPriority: ['-free-maker-profile', 'free-maker-profile', 'free-profile'],
		opportunitySlugInList: ['free-profile', 'free-maker-profile', '-free-maker-profile'],
	},
];

const PEERPUSH_DESTINATIONS: readonly AutoLaunchDestinationSeedRow[] = [
	{
		destinationId: 'd5f7d000-0030-4000-a000-000000000004',
		providerSlug: 'peerpush-standard-launch',
		siteSlug: 'peerpush',
		name: 'PeerPush — Standard launch',
		shortDescription:
			'Instant publish on PeerPush; extension autofills the submit flow at peerpush.com/submit.',
		startUrl: 'https://peerpush.com/submit',
		sortOrder: 40,
		pickerGroupKey: null,
		pickerGroupTitle: null,
		opportunitySlug: 'standard-launch',
	},
	{
		destinationId: 'd5f7d000-0030-4000-a000-000000000005',
		providerSlug: 'peerpush-free-queue',
		siteSlug: 'peerpush',
		name: 'PeerPush — Free queue',
		shortDescription:
			'Free queue on PeerPush; extension autofills after you open pricing and start submit.',
		startUrl: 'https://peerpush.com/pricing',
		sortOrder: 35,
		pickerGroupKey: null,
		pickerGroupTitle: null,
		opportunitySlug: 'free-queue',
	},
];

const OPEN_LAUNCH_DESTINATIONS: readonly AutoLaunchDestinationSeedRow[] = [
	{
		destinationId: 'd5f7d000-0030-4000-a000-000000000006',
		providerSlug: 'open-launch-premium-launch',
		siteSlug: 'open-launch',
		name: 'Open Launch — Premium launch',
		shortDescription:
			'Premium slot on Open Launch; extension autofills the submit wizard at open-launch.com/projects/submit.',
		startUrl: 'https://open-launch.com/projects/submit',
		sortOrder: 45,
		pickerGroupKey: 'open-launch',
		pickerGroupTitle: 'Open Launch',
		opportunitySlug: 'premium-launch',
	},
	{
		destinationId: 'd5f7d000-0030-4000-a000-000000000007',
		providerSlug: 'open-launch-free-launch',
		siteSlug: 'open-launch',
		name: 'Open Launch — Free launch',
		shortDescription:
			'Free queue on Open Launch; extension autofills after you open pricing and start submit.',
		startUrl: 'https://open-launch.com/pricing',
		sortOrder: 42,
		pickerGroupKey: 'open-launch',
		pickerGroupTitle: 'Open Launch',
		opportunitySlug: 'free-launch',
	},
];

const TINYLAUNCH_DESTINATIONS: readonly AutoLaunchDestinationSeedRow[] = [
	{
		destinationId: 'd5f7d000-0030-4000-a000-000000000008',
		providerSlug: 'tinylaunch-premium-launch',
		siteSlug: 'tinylaunch',
		name: 'TinyLaunch — Premium launch',
		shortDescription:
			'Premium launch on TinyLaunch; extension autofills the create-startup form at tinylaunch.com/dashboard/startups/new.',
		startUrl: 'https://www.tinylaunch.com/dashboard/startups/new',
		sortOrder: 48,
		pickerGroupKey: 'tinylaunch',
		pickerGroupTitle: 'TinyLaunch',
		opportunitySlug: 'premium-launch',
	},
	{
		destinationId: 'd5f7d000-0030-4000-a000-000000000009',
		providerSlug: 'tinylaunch-standard-launch',
		siteSlug: 'tinylaunch',
		name: 'TinyLaunch — Standard launch',
		shortDescription:
			'Free Standard queue on TinyLaunch; extension autofills after you open pricing and create your startup.',
		startUrl: 'https://www.tinylaunch.com/pricing',
		sortOrder: 46,
		pickerGroupKey: 'tinylaunch',
		pickerGroupTitle: 'TinyLaunch',
		opportunitySlug: 'standard-launch',
	},
];

export const AUTO_LAUNCH_DESTINATION_SEED_MODULES: readonly AutoLaunchDestinationSeedModule[] = [
	{
		siteKey: 'uneed',
		sqlFileName: '503_20261013_seed_uneed.sql',
		generationMode: 'composite',
		moduleDate: '20261013',
		moduleScopeLabel: 'Seed (Uneed destinations + editorial opportunity flags)',
		preambleComments: [
			'-- Idempotent: matches opportunities on link_directory_sites.slug = \'uneed\' + known opportunity',
			'-- slugs (production CMS rows use random UUIDs; local exemplar uses fixed UUIDs).',
		],
		destinations: UNEED_DESTINATIONS,
	},
	{
		siteKey: 'peerpush',
		sqlFileName: '504_20261016_seed_peerpush_destination.sql',
		generationMode: 'full',
		moduleDate: '20261016',
		moduleScopeLabel: 'Seed (PeerPush free queue + Standard launch destinations)',
		preambleComments: [
			'-- PeerPush submit form: logo file upload uses extension file fill (no fillMode on file steps).',
			'-- Tag-style discovery fields use fillMode "tags"; product description is plain text (profile HTML is stripped at fill/compare).',
		],
		destinations: PEERPUSH_DESTINATIONS,
	},
	{
		siteKey: 'open-launch',
		sqlFileName: '505_20261109_seed_open_launch_destination.sql',
		generationMode: 'full',
		moduleDate: '20261108',
		moduleScopeLabel: 'Seed (Open Launch premium + free queue destinations)',
		preambleComments: [
			'-- Joins link_directory_opportunities on site slug open-launch (CMS / listing manager in production).',
			'-- Launch date and Review steps are user-completed in v1 (no autofilled fields).',
		],
		destinations: OPEN_LAUNCH_DESTINATIONS,
	},
	{
		siteKey: 'tinylaunch',
		sqlFileName: '506_20261117_seed_tinylaunch_destination.sql',
		generationMode: 'full',
		moduleDate: '20261117',
		moduleScopeLabel: 'Seed (TinyLaunch premium + Standard queue destinations)',
		preambleComments: [
			'-- Joins link_directory_opportunities on site slug tinylaunch (catalog backfill / listing manager).',
			'-- Scheduling, payment, and upvote pledge stay manual after the create-startup form is filled.',
		],
		destinations: TINYLAUNCH_DESTINATIONS,
	},
];

export const AUTO_LAUNCH_DESTINATION_SEED_ROWS: readonly AutoLaunchDestinationSeedRow[] =
	AUTO_LAUNCH_DESTINATION_SEED_MODULES.flatMap((module) => module.destinations);

export const AUTO_LAUNCH_DESTINATION_SEED_PROVIDER_SLUGS: readonly string[] =
	AUTO_LAUNCH_DESTINATION_SEED_ROWS.map((row) => row.providerSlug);

/** SQL splice markers for modules with `generationMode: 'composite'` (hand-written prelude + generated destinations). */
export const AUTO_LAUNCH_DESTINATION_SEEDS_GENERATED_MARKER_START =
	'-- GENERATED:auto_launch_destinations — pnpm sync:auto-launch-destinations';

export const AUTO_LAUNCH_DESTINATION_SEEDS_GENERATED_MARKER_END =
	'-- END GENERATED:auto_launch_destinations';