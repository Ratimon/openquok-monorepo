import { describe, expect, it } from 'vitest';

import { buildAutoLaunchHandoffRequest } from './directoryLaunchHandoff';

describe('buildAutoLaunchHandoffRequest', () => {
	it('coerces nullable profile fields and empty extension config', () => {
		const request = buildAutoLaunchHandoffRequest({
			submissionId: '11111111-1111-4111-8111-111111111111',
			launchToken: 'token',
			providerSlug: 'uneed-join-line',
			startUrl: 'https://uneed.best/pricing',
			profileSnapshot: {
				name: 'Acme',
				tagline: undefined as unknown as null,
				description: null,
				website_url: null,
				logo_url: null,
				profile_data: null as unknown as Record<string, unknown>,
				integration_customer_id: null
			},
			extensionConfig: { version: '1' as unknown as number, steps: [] },
			steps: []
		});

		expect(request.profileSnapshot.profile_data).toEqual({});
		expect(request.extensionConfig.version).toBe(1);
	});
});
