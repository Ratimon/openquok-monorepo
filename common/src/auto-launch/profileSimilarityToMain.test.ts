import type { AutoLaunchProfileSnapshot } from '../browser-extension/pageAssist.js';
import { profileSimilarityPercentToMain } from './profileSimilarityToMain.js';

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

describe('profileSimilarityPercentToMain', () => {
	it('returns 100 for identical snapshots', () => {
		const main = snapshot();
		expect(profileSimilarityPercentToMain(main, { ...main })).toBe(100);
	});

	it('returns lower score when variant fields diverge', () => {
		const main = snapshot();
		const variant = snapshot({ name: 'Acme Pro', tagline: 'Different' });
		const score = profileSimilarityPercentToMain(main, variant);
		expect(score).toBeGreaterThan(0);
		expect(score).toBeLessThan(100);
	});

	it('counts union of profile_data keys from main and variant', () => {
		const main = snapshot({ profile_data: { pricing_type: 'free', social_x: 'https://x.test' } });
		const variant = snapshot({
			profile_data: { pricing_type: 'free', tags: ['saas'] },
		});
		expect(profileSimilarityPercentToMain(main, variant)).toBe(75);
	});
});
