import { COOKIE_SESSION_PROVIDERS } from './cookieSessionProviders.js';
import { resolveExtensionPublishMode } from './extensionPublishMode.js';

describe('extensionPublishMode', () => {
	it('assigns publish modes in the cookie-session catalog', () => {
		const skool = COOKIE_SESSION_PROVIDERS.find((p) => p.identifier === 'skool');
		expect(skool?.publishMode).toBe('server_api');
		expect(COOKIE_SESSION_PROVIDERS).toHaveLength(1);
	});

	it('prefers explicit extensionPublishMode on the provider', () => {
		expect(
			resolveExtensionPublishMode({
				identifier: 'reddit',
				isChromeExtension: false,
				extensionPublishMode: 'member_browser_handoff',
			})
		).toBe('member_browser_handoff');
		expect(
			resolveExtensionPublishMode({
				identifier: 'reddit',
				isChromeExtension: true,
				extensionPublishMode: 'server_api',
			})
		).toBe('server_api');
	});

	it('falls back to cookie-session catalog by identifier', () => {
		expect(resolveExtensionPublishMode({ identifier: 'skool' })).toBe('server_api');
	});

	it('defaults chrome-extension providers without a catalog row to server_api', () => {
		expect(
			resolveExtensionPublishMode({ identifier: 'future-extension', isChromeExtension: true })
		).toBe('server_api');
	});

	it('returns undefined for non-extension providers without explicit mode', () => {
		expect(resolveExtensionPublishMode({ identifier: 'threads' })).toBeUndefined();
		expect(resolveExtensionPublishMode({ identifier: 'reddit' })).toBeUndefined();
	});
});
