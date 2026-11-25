import type {
	AutoLaunchExtensionConfig,
	AutoLaunchProfileSnapshot,
} from '../browser-extension/pageAssist.js';
import {
	NICK_LAUNCHES_LISTING_FORM_EXTENSION_CONFIG,
	NICK_LAUNCHES_MAKER_PROFILE_EXTENSION_CONFIG,
} from './destination-configs/nick-launches.js';
import {
	collectProfileFieldsFromExtensionConfig,
	getDestinationReadiness,
	getProfileLaunchSummary,
} from './profileLaunchReadiness.js';

function snapshot(
	overrides: Partial<AutoLaunchProfileSnapshot> = {}
): AutoLaunchProfileSnapshot {
	return {
		name: 'Acme',
		tagline: 'Ship faster',
		description: 'Product description',
		website_url: 'https://acme.test',
		logo_url: null,
		profile_data: { pricing_type: 'free' },
		integration_customer_id: null,
		...overrides,
	};
}

const joinLineConfig: AutoLaunchExtensionConfig = {
	version: 1,
	steps: [
		{
			id: 'product_info',
			label: 'Product info',
			fields: [
				{ key: 'name', label: 'Name', profilePath: 'name' },
				{ key: 'tagline', label: 'Tagline', profilePath: 'tagline' },
				{ key: 'logo', label: 'Logo', profilePath: 'logo_url' },
				{ key: 'name_dup', label: 'Name again', profilePath: 'name' },
			],
		},
	],
};

describe('collectProfileFieldsFromExtensionConfig', () => {
	it('dedupes profile paths and keeps the first label', () => {
		expect(collectProfileFieldsFromExtensionConfig(joinLineConfig)).toEqual([
			{ path: 'logo_url', label: 'Logo' },
			{ path: 'name', label: 'Name' },
			{ path: 'tagline', label: 'Tagline' },
		]);
	});
});

describe('getDestinationReadiness', () => {
	it('counts filled vs missing fields from extension config', () => {
		const readiness = getDestinationReadiness(snapshot(), joinLineConfig);
		expect(readiness.totalFields).toBe(3);
		expect(readiness.filledFields).toBe(2);
		expect(readiness.missingFields).toEqual([{ path: 'logo_url', label: 'Logo' }]);
		expect(readiness.isReady).toBe(false);
	});

	it('marks ready when all configured fields resolve', () => {
		const readiness = getDestinationReadiness(
			snapshot({ logo_url: 'org/profile/logo.webp' }),
			joinLineConfig
		);
		expect(readiness.isReady).toBe(true);
		expect(readiness.missingFields).toEqual([]);
	});
});

const openLaunchPremiumConfig: AutoLaunchExtensionConfig = {
	version: 1,
	steps: [
		{
			id: 'details',
			label: 'Details',
			fields: [
				{
					key: 'tech_stack',
					label: 'Tech stack',
					profilePath: 'profile_data.tech_stack',
				},
				{
					key: 'categories',
					label: 'Categories',
					profilePath: 'profile_data.categories',
				},
			],
		},
	],
};

describe('nick-launches destination readiness', () => {
	const listingSnapshot = (): AutoLaunchProfileSnapshot =>
		snapshot({
			logo_url: 'org/logo.webp',
			profile_data: {
				gallery_urls: ['org/shot-1.webp'],
				categories: ['Developer Tools'],
				use_cases: ['Social Media Automation', 'Content Creation'],
				pricing_type: 'freemium',
				is_open_source: false,
				social_x: 'openquok',
				launch_video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
			},
		});

	it('lists gallery, categories, and pricing among required listing paths', () => {
		const paths = collectProfileFieldsFromExtensionConfig(
			NICK_LAUNCHES_LISTING_FORM_EXTENSION_CONFIG
		).map((field) => field.path);
		expect(paths).toEqual(
			expect.arrayContaining([
				'profile_data.gallery_urls',
				'profile_data.categories',
				'profile_data.use_cases',
				'profile_data.pricing_type',
			])
		);
	});

	it('is ready when listing paths from the fixture are filled', () => {
		const readiness = getDestinationReadiness(
			listingSnapshot(),
			NICK_LAUNCHES_LISTING_FORM_EXTENSION_CONFIG
		);
		expect(readiness.isReady).toBe(true);
		expect(readiness.missingFields).toEqual([]);
	});

	it('reports missing screenshots when gallery_urls is empty', () => {
		const readiness = getDestinationReadiness(
			snapshot({
				logo_url: 'org/logo.webp',
				profile_data: {
					categories: ['AI'],
					pricing_type: 'free',
				},
			}),
			NICK_LAUNCHES_LISTING_FORM_EXTENSION_CONFIG
		);
		expect(readiness.missingFields).toEqual(
			expect.arrayContaining([{ path: 'profile_data.gallery_urls', label: 'Screenshots' }])
		);
		expect(readiness.isReady).toBe(false);
	});

	it('counts maker profile compare paths without first/last name fields', () => {
		const paths = collectProfileFieldsFromExtensionConfig(NICK_LAUNCHES_MAKER_PROFILE_EXTENSION_CONFIG).map(
			(field) => field.path
		);
		expect(paths).toContain('tagline');
		expect(paths).toContain('profile_data.social_github');
		expect(paths).not.toContain('profile_data.maker_first_name');
	});
});

describe('open-launch destination readiness', () => {
	it('reports missing tech stack when extension config requires it', () => {
		const readiness = getDestinationReadiness(
			snapshot({ profile_data: { categories: ['SaaS'] } }),
			openLaunchPremiumConfig
		);
		expect(readiness.totalFields).toBe(2);
		expect(readiness.filledFields).toBe(1);
		expect(readiness.missingFields).toEqual([
			{ path: 'profile_data.tech_stack', label: 'Tech stack' },
		]);
		expect(readiness.isReady).toBe(false);
	});

	it('is ready when categories and tech stack are filled', () => {
		const readiness = getDestinationReadiness(
			snapshot({
				profile_data: { categories: ['SaaS'], tech_stack: ['Next.js', 'PostgreSQL'] },
			}),
			openLaunchPremiumConfig
		);
		expect(readiness.isReady).toBe(true);
		expect(readiness.missingFields).toEqual([]);
	});
});

describe('getProfileLaunchSummary', () => {
	const destinations = [
		{
			id: 'dest-a',
			providerSlug: 'uneed-join-line',
			name: 'Uneed',
			sortOrder: 1,
			extensionConfig: joinLineConfig,
		},
		{
			id: 'dest-b',
			providerSlug: 'peerpush-standard-launch',
			name: 'PeerPush',
			sortOrder: 2,
			extensionConfig: {
				steps: [
					{
						id: 'basic',
						label: 'Basic',
						fields: [{ key: 'name', label: 'Name', profilePath: 'name' }],
					},
				],
			} satisfies AutoLaunchExtensionConfig,
		},
	];

	it('aggregates submission counts and picks the lowest fill-ratio next gap', () => {
		const summary = getProfileLaunchSummary(
			snapshot(),
			destinations,
			[
				{
					destinationId: 'dest-b',
					status: 'completed',
					syncStatus: 'synced',
					completedAt: '2026-01-02T00:00:00.000Z',
				},
			]
		);

		expect(summary.publishedDestinationCount).toBe(2);
		expect(summary.publishedDirectorySiteCount).toBe(2);
		expect(summary.submittedCount).toBe(1);
		expect(summary.submittedDirectorySiteCount).toBe(1);
		expect(summary.staleCount).toBe(0);
		expect(summary.nextGap?.destinationId).toBe('dest-a');
		expect(summary.nextGap?.missingFieldCount).toBe(1);
		expect(summary.destinations).toHaveLength(2);
		expect(summary.destinations[0]?.submissionStatus).toBe('none');
		expect(summary.destinations[1]?.submissionStatus).toBe('completed');
		expect(summary.destinations[1]?.syncStatus).toBe('synced');
	});

	it('counts stale submissions at profile level', () => {
		const summary = getProfileLaunchSummary(snapshot({ logo_url: 'logo.webp' }), destinations, [
			{
				destinationId: 'dest-a',
				status: 'completed',
				syncStatus: 'stale',
			},
			{
				destinationId: 'dest-b',
				status: 'completed',
				syncStatus: 'stale',
			},
		]);
		expect(summary.staleCount).toBe(2);
		expect(summary.submittedCount).toBe(2);
		expect(summary.submittedDirectorySiteCount).toBe(2);
		expect(summary.nextGap).toBeNull();
	});

	it('counts unique directory sites when multiple launch variants share a site', () => {
		const destinations = [
			{
				id: 'dest-uneed-join',
				providerSlug: 'uneed-join-line',
				name: 'Uneed — Join the line',
				sortOrder: 1,
				extensionConfig: joinLineConfig,
			},
			{
				id: 'dest-uneed-paid',
				providerSlug: 'uneed-paid-launch',
				name: 'Uneed — Paid launch',
				sortOrder: 2,
				extensionConfig: joinLineConfig,
			},
			{
				id: 'dest-peerpush',
				providerSlug: 'peerpush-standard-launch',
				name: 'PeerPush — Standard launch',
				sortOrder: 3,
				extensionConfig: joinLineConfig,
			},
		];

		const summary = getProfileLaunchSummary(snapshot(), destinations, [
			{
				destinationId: 'dest-uneed-join',
				status: 'completed',
				syncStatus: 'synced',
			},
		]);

		expect(summary.publishedDestinationCount).toBe(3);
		expect(summary.publishedDirectorySiteCount).toBe(2);
		expect(summary.submittedCount).toBe(1);
		expect(summary.submittedDirectorySiteCount).toBe(1);
	});
});
