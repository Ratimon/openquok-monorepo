import { describe, expect, it } from 'vitest';

import { buildBusinessProfilePickerOptions } from './buildBusinessProfilePickerOptions';

describe('buildBusinessProfilePickerOptions', () => {
	it('includes channel groups and product-only profiles', () => {
		const options = buildBusinessProfilePickerOptions(
			[{ id: 'cust-1', name: 'Test 1' }],
			[
				{
					id: 'prod-1',
					organizationId: 'org',
					integrationCustomerId: 'cust-1',
					name: 'Test 1',
					tagline: null,
					description: null,
					websiteUrl: null,
					logoUrl: null,
					profileData: {},
					createdAt: '',
					updatedAt: ''
				},
				{
					id: 'prod-2',
					organizationId: 'org',
					integrationCustomerId: null,
					name: 'Product 1',
					tagline: null,
					description: null,
					websiteUrl: null,
					logoUrl: null,
					profileData: {},
					createdAt: '',
					updatedAt: ''
				}
			]
		);

		expect(options.map((o) => o.name)).toEqual(['Product 1', 'Test 1']);
		expect(options.find((o) => o.name === 'Product 1')?.key).toBe('product:prod-2');
		expect(options.find((o) => o.name === 'Test 1')?.integrationCustomerId).toBe('cust-1');
	});
});
