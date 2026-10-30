import { describe, expect, it } from 'vitest';

import {
	buildDashboardAccountAddChannelPath,
	buildDashboardAccountAddChannelUrl,
	isAccountAddChannelDeepLink,
} from './accountDeepLinks.js';

describe('accountDeepLinks', () => {
	it('builds account add-channel URLs', () => {
		expect(buildDashboardAccountAddChannelPath()).toBe('/account?addChannel=1');
		expect(buildDashboardAccountAddChannelUrl('https://www.openquok.com')).toBe(
			'https://www.openquok.com/account?addChannel=1'
		);
		expect(isAccountAddChannelDeepLink(new URLSearchParams('addChannel=1'))).toBe(true);
		expect(isAccountAddChannelDeepLink(new URLSearchParams('tab=products'))).toBe(false);
	});
});
