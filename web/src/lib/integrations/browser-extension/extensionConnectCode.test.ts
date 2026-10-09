import { describe, expect, it } from 'vitest';

import { encodeExtensionConnectCode } from '$lib/integrations/browser-extension/extensionConnectCode';

describe('encodeExtensionConnectCode', () => {
	it('encodes cookie name/value map as base64 JSON', () => {
		const code = encodeExtensionConnectCode([
			{ name: 'auth_token', value: 'tok', domain: '.skool.com' },
			{ name: 'client_id', value: 'cid', domain: '.skool.com' }
		]);
		const json = JSON.parse(atob(code)) as Record<string, string>;
		expect(json).toEqual({ auth_token: 'tok', client_id: 'cid' });
	});
});
