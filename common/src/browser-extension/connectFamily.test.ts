import { COOKIE_SESSION_PROVIDERS } from './cookieSessionProviders.js';
import {
	CREDENTIALS_SOCIAL_PROVIDER_IDENTIFIERS,
	getExtensionConnectFamily,
	isExtensionSocialPostingProviderId,
	listIdentifiersByExtensionConnectFamily,
	OAUTH_SOCIAL_PROVIDER_IDENTIFIERS,
} from './connectFamily.js';
import { directoryLaunchProviders } from './pageAssist.js';

describe('connectFamily', () => {
	it('maps OAuth social channel keys', () => {
		for (const identifier of OAUTH_SOCIAL_PROVIDER_IDENTIFIERS) {
			expect(getExtensionConnectFamily(identifier)).toBe('oauth');
			expect(isExtensionSocialPostingProviderId(identifier)).toBe(true);
		}
	});

	it('maps credentials social channel keys', () => {
		for (const identifier of CREDENTIALS_SOCIAL_PROVIDER_IDENTIFIERS) {
			expect(getExtensionConnectFamily(identifier)).toBe('credentials');
			expect(isExtensionSocialPostingProviderId(identifier)).toBe(true);
		}
	});

	it('maps cookie-session providers from the shared catalog', () => {
		for (const provider of COOKIE_SESSION_PROVIDERS) {
			expect(getExtensionConnectFamily(provider.identifier)).toBe('cookie_session');
			expect(isExtensionSocialPostingProviderId(provider.identifier)).toBe(true);
		}
	});

	it('maps directory launch provider slugs', () => {
		for (const provider of directoryLaunchProviders) {
			expect(getExtensionConnectFamily(provider.identifier)).toBe('directory_launch');
			expect(isExtensionSocialPostingProviderId(provider.identifier)).toBe(false);
		}
	});

	it('normalizes identifier casing', () => {
		expect(getExtensionConnectFamily('  THREADS  ')).toBe('oauth');
	});

	it('returns undefined for unknown identifiers', () => {
		expect(getExtensionConnectFamily('')).toBeUndefined();
		expect(getExtensionConnectFamily('not-a-channel')).toBeUndefined();
	});

	it('lists identifiers per family without overlap', () => {
		const oauth = listIdentifiersByExtensionConnectFamily('oauth');
		const credentials = listIdentifiersByExtensionConnectFamily('credentials');
		const cookieSession = listIdentifiersByExtensionConnectFamily('cookie_session');
		const directory = listIdentifiersByExtensionConnectFamily('directory_launch');

		expect(oauth).toHaveLength(OAUTH_SOCIAL_PROVIDER_IDENTIFIERS.length);
		expect(credentials).toHaveLength(CREDENTIALS_SOCIAL_PROVIDER_IDENTIFIERS.length);
		expect(cookieSession).toHaveLength(COOKIE_SESSION_PROVIDERS.length);
		expect(directory).toHaveLength(directoryLaunchProviders.length);

		const all = [...oauth, ...credentials, ...cookieSession, ...directory];
		expect(new Set(all).size).toBe(all.length);
	});
});
