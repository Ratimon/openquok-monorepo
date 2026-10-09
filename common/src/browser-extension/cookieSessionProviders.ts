import type { BrowserExtensionCookieRef } from './types.js';

/**
 * Cookie-based social channels: the extension reads session cookies for the provider
 * and the API validates them on connect / periodic refresh.
 */
export interface CookieSessionProvider {
	/** Integration identifier (e.g. `skool`) — matches `SocialProvider.identifier`. */
	identifier: string;
	/** Human label shown in extension diagnostics and connect UI. */
	name: string;
	/** URL passed to `chrome.cookies.getAll({ url })` when harvesting cookies. */
	cookieUrl: string;
	/** Manifest `host_permissions` entry for this provider. */
	hostPermission: string;
	/** Cookies that must be present for a successful connect. */
	requiredCookies: readonly BrowserExtensionCookieRef[];
}

/** Catalog metadata aligned with backend `extensionCookies` on chrome-extension providers. */
export function extensionCookiesForProvider(
	provider: CookieSessionProvider
): BrowserExtensionCookieRef[] {
	return [...provider.requiredCookies];
}

const SKOOL_PROVIDER: CookieSessionProvider = {
	identifier: 'skool',
	name: 'Skool',
	cookieUrl: 'https://www.skool.com/',
	hostPermission: '*://*.skool.com/*',
	requiredCookies: [
		{ name: 'auth_token', domain: '.skool.com' },
		{ name: 'client_id', domain: '.skool.com' },
	],
};

/** Registered cookie-session channels (extension `provider.registry.ts` mirrors this list). */
export const COOKIE_SESSION_PROVIDERS: readonly CookieSessionProvider[] = [SKOOL_PROVIDER];

const providersById = new Map<string, CookieSessionProvider>(
	COOKIE_SESSION_PROVIDERS.map((provider) => [provider.identifier, provider])
);

export function getCookieSessionProvider(identifier: string): CookieSessionProvider | undefined {
	return providersById.get(identifier);
}

export function isCookieSessionProviderId(identifier: string): boolean {
	return providersById.has(identifier);
}

export function listCookieSessionProviderSummaries(): { identifier: string; name: string }[] {
	return COOKIE_SESSION_PROVIDERS.map(({ identifier, name }) => ({ identifier, name }));
}
