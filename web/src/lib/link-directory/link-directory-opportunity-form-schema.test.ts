import { describe, expect, it } from 'vitest';

import { linkDirectoryOpportunityFormSchema } from './link-directory-admin.types';

const basePayload = {
	slug: 'test-slug',
	title: 'Test',
	opportunity_type_id: '00000000-0000-4000-8000-000000000001'
};

describe('linkDirectoryOpportunityFormSchema CTA rules', () => {
	it('requires channel for connect_channel', () => {
		const result = linkDirectoryOpportunityFormSchema.safeParse({
			...basePayload,
			openquok_cta_kind: 'connect_channel',
			openquok_channel_slug: null
		});
		expect(result.success).toBe(false);
	});

	it('accepts connect_channel with channel slug', () => {
		const result = linkDirectoryOpportunityFormSchema.safeParse({
			...basePayload,
			openquok_cta_kind: 'connect_channel',
			openquok_channel_slug: 'facebook'
		});
		expect(result.success).toBe(true);
	});
});
