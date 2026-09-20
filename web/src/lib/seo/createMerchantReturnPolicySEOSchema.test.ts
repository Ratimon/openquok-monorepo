import { describe, expect, it } from 'vitest';

import {
	createOpenQuokMerchantReturnPolicy,
	OPENQUOK_REFUND_POLICY_DOCS_PATH,
	resolveOpenQuokRefundPolicyUrl
} from '$lib/seo/createMerchantReturnPolicySEOSchema';

describe('createOpenQuokMerchantReturnPolicy', () => {
	it('builds a MerchantReturnPolicy with the Cloud refund docs link', () => {
		expect(OPENQUOK_REFUND_POLICY_DOCS_PATH).toBe('docs/cloud/refunds-and-support');
		expect(resolveOpenQuokRefundPolicyUrl('https://www.openquok.com')).toBe(
			'https://www.openquok.com/docs/cloud/refunds-and-support'
		);
		expect(createOpenQuokMerchantReturnPolicy({ origin: 'https://www.openquok.com' })).toEqual({
			'@type': 'MerchantReturnPolicy',
			merchantReturnLink: 'https://www.openquok.com/docs/cloud/refunds-and-support'
		});
	});
});
