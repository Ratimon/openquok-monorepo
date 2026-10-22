import type {
	AutoLaunchExtensionConfig,
	AutoLaunchProfileSnapshot,
} from '../browser-extension/pageAssist.js';
import {
	buildListingProfileFingerprintPayload,
	collectProfilePathsFromExtensionConfig,
	computeListingProfileFingerprint,
	resolveProfilePathValue,
} from './listingProfileFingerprint.js';

function snapshot(
	overrides: Partial<AutoLaunchProfileSnapshot> = {}
): AutoLaunchProfileSnapshot {
	return {
		name: 'Acme',
		tagline: 'Ship faster',
		description: 'Product description',
		website_url: 'https://acme.test',
		logo_url: null,
		profile_data: { pricing_type: 'free', internal_note: 'ignore me' },
		integration_customer_id: null,
		...overrides,
	};
}

const uneedSocialConfig: AutoLaunchExtensionConfig = {
	version: 1,
	steps: [
		{
			id: 'socials',
			label: 'Socials',
			fields: [
				{ key: 'social_x', label: 'X', profilePath: 'profile_data.social_x' },
				{ key: 'social_github', label: 'GitHub', profilePath: 'profile_data.social_github' },
			],
		},
	],
};

const uneedJoinLineConfig: AutoLaunchExtensionConfig = {
	version: 1,
	steps: [
		{
			id: 'product_info',
			label: 'Product info',
			fields: [
				{ key: 'name', label: 'Name', profilePath: 'name' },
				{ key: 'tagline', label: 'Tagline', profilePath: 'tagline' },
				{ key: 'description', label: 'Description', profilePath: 'description' },
				{ key: 'website', label: 'Website', profilePath: 'website_url' },
				{ key: 'pricing', label: 'Pricing', profilePath: 'profile_data.pricing_type' },
			],
		},
		{
			id: 'media',
			label: 'Media',
			fields: [
				{ key: 'logo', label: 'Logo', profilePath: 'logo_url' },
				{ key: 'gallery', label: 'Gallery', profilePath: 'profile_data.gallery_urls' },
				{ key: 'name_dup', label: 'Name again', profilePath: 'name' },
			],
		},
	],
};

describe('collectProfilePathsFromExtensionConfig', () => {
	it('returns unique sorted profile paths from all steps', () => {
		expect(collectProfilePathsFromExtensionConfig(uneedJoinLineConfig)).toEqual([
			'description',
			'logo_url',
			'name',
			'profile_data.gallery_urls',
			'profile_data.pricing_type',
			'tagline',
			'website_url',
		]);
	});

	it('ignores blank profilePath values', () => {
		const config: AutoLaunchExtensionConfig = {
			steps: [
				{
					id: 's1',
					label: 'Step',
					fields: [
						{ key: 'a', label: 'A', profilePath: '  ' },
						{ key: 'b', label: 'B', profilePath: 'name' },
					],
				},
			],
		};
		expect(collectProfilePathsFromExtensionConfig(config)).toEqual(['name']);
	});
});

describe('resolveProfilePathValue', () => {
	it('reads top-level and nested profile_data paths', () => {
		const snap = snapshot({
			profile_data: { pricing_type: 'paid', gallery_urls: ['https://a.test', 'https://b.test'] },
		});
		expect(resolveProfilePathValue(snap, 'name')).toBe('Acme');
		expect(resolveProfilePathValue(snap, 'profile_data.pricing_type')).toBe('paid');
		expect(resolveProfilePathValue(snap, 'profile_data.gallery_urls')).toBe(
			'https://a.test, https://b.test'
		);
	});

	it('treats empty strings and missing paths as null', () => {
		const snap = snapshot({ tagline: '   ', logo_url: null });
		expect(resolveProfilePathValue(snap, 'tagline')).toBeNull();
		expect(resolveProfilePathValue(snap, 'logo_url')).toBeNull();
		expect(resolveProfilePathValue(snap, 'profile_data.missing')).toBeNull();
	});

	it('reads social and sell profile_data paths', () => {
		const snap = snapshot({
			profile_data: {
				social_x: 'https://x.com/acme',
				acquisition_listed: true,
				selling_reason: 'Ready for a handoff to a focused buyer.',
			},
		});
		expect(resolveProfilePathValue(snap, 'profile_data.social_x')).toBe('https://x.com/acme');
		expect(resolveProfilePathValue(snap, 'profile_data.acquisition_listed')).toBe('true');
	});
});

describe('computeListingProfileFingerprint', () => {
	it('builds a stable canonical payload with sorted keys', () => {
		const snap = snapshot();
		const paths = collectProfilePathsFromExtensionConfig(uneedJoinLineConfig);
		expect(buildListingProfileFingerprintPayload(snap, paths)).toBe(
			'{"description":"Product description","logo_url":null,"name":"Acme","profile_data.gallery_urls":null,"profile_data.pricing_type":"free","tagline":"Ship faster","website_url":"https://acme.test"}'
		);
	});

	it('changes when a fill-relevant field changes', () => {
		const base = computeListingProfileFingerprint(snapshot(), uneedJoinLineConfig);
		const renamed = computeListingProfileFingerprint(
			snapshot({ name: 'Acme Labs' }),
			uneedJoinLineConfig
		);
		expect(renamed).not.toBe(base);
	});

	it('changes when a configured social profile_data field changes', () => {
		const base = computeListingProfileFingerprint(
			snapshot({
				profile_data: { social_x: 'https://x.com/acme', social_github: null },
			}),
			uneedSocialConfig
		);
		const updated = computeListingProfileFingerprint(
			snapshot({
				profile_data: { social_x: 'https://x.com/acme-labs', social_github: null },
			}),
			uneedSocialConfig
		);
		expect(updated).not.toBe(base);
	});

	it('does not change when an unreferenced profile_data field changes', () => {
		const base = computeListingProfileFingerprint(snapshot(), uneedJoinLineConfig);
		const tweaked = computeListingProfileFingerprint(
			snapshot({
				profile_data: {
					pricing_type: 'free',
					internal_note: 'updated',
					extra_field: 'new',
				},
			}),
			uneedJoinLineConfig
		);
		expect(tweaked).toBe(base);
	});

	it('returns the SHA-256 hex digest of the canonical payload', () => {
		const snap = snapshot();
		const paths = collectProfilePathsFromExtensionConfig(uneedJoinLineConfig);
		const payload = buildListingProfileFingerprintPayload(snap, paths);
		const expected = computeListingProfileFingerprint(snap, uneedJoinLineConfig);
		expect(expected).toMatch(/^[\da-f]{64}$/);
		expect(computeListingProfileFingerprint(snap, uneedJoinLineConfig)).toBe(expected);
		expect(payload.length).toBeGreaterThan(2);
	});

	it('hashes an empty path set as {}', () => {
		const digest = computeListingProfileFingerprint(snapshot(), { steps: [] });
		expect(digest).toBe(
			'44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a'
		);
	});
});
