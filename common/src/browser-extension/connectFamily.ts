import { COOKIE_SESSION_PROVIDERS } from './cookieSessionProviders.js';
import { directoryLaunchProviders } from './pageAssist.js';

/**
 * How a channel is connected in Add Channel — used by the extension to filter
 * integrations (Social composer vs Directory tab). Aligns with connect-rules.md.
 */
export type ExtensionConnectFamily =
	| 'oauth'
	| 'credentials'
	| 'cookie_session'
	| 'directory_launch';

export const EXTENSION_CONNECT_FAMILIES: readonly ExtensionConnectFamily[] = [
	'oauth',
	'credentials',
	'cookie_session',
	'directory_launch',
];

/** Social posting channel keys that use platform OAuth. */
export const OAUTH_SOCIAL_PROVIDER_IDENTIFIERS = [
	'threads',
	'facebook',
	'instagram-business',
	'instagram-standalone',
	'linkedin',
	'linkedin-page',
	'youtube',
	'tiktok',
	'x',
] as const;

export type OAuthSocialProviderIdentifier = (typeof OAUTH_SOCIAL_PROVIDER_IDENTIFIERS)[number];

/** Social posting channel keys where the user pastes API credentials in Add Channel. */
export const CREDENTIALS_SOCIAL_PROVIDER_IDENTIFIERS = ['bluesky', 'devto'] as const;

export type CredentialsSocialProviderIdentifier =
	(typeof CREDENTIALS_SOCIAL_PROVIDER_IDENTIFIERS)[number];

export type ExtensionConnectFamilyMetadata = {
	identifier: string;
	connectFamily: ExtensionConnectFamily;
};

function buildConnectFamilyByIdentifier(): Map<string, ExtensionConnectFamily> {
	const map = new Map<string, ExtensionConnectFamily>();
	for (const identifier of OAUTH_SOCIAL_PROVIDER_IDENTIFIERS) {
		map.set(identifier, 'oauth');
	}
	for (const identifier of CREDENTIALS_SOCIAL_PROVIDER_IDENTIFIERS) {
		map.set(identifier, 'credentials');
	}
	for (const provider of COOKIE_SESSION_PROVIDERS) {
		map.set(provider.identifier, 'cookie_session');
	}
	for (const provider of directoryLaunchProviders) {
		map.set(provider.identifier, 'directory_launch');
	}
	return map;
}

const connectFamilyByIdentifier = buildConnectFamilyByIdentifier();

export function isExtensionConnectFamily(value: string): value is ExtensionConnectFamily {
	return (EXTENSION_CONNECT_FAMILIES as readonly string[]).includes(value);
}

export function getExtensionConnectFamily(identifier: string): ExtensionConnectFamily | undefined {
	const normalized = identifier.trim().toLowerCase();
	if (!normalized) return undefined;
	return connectFamilyByIdentifier.get(normalized);
}

/** Channels the extension Social tab may schedule via the session API (not directory launch). */
export function isExtensionSocialPostingProviderId(identifier: string): boolean {
	const family = getExtensionConnectFamily(identifier);
	return (
		family === 'oauth' || family === 'credentials' || family === 'cookie_session'
	);
}

export function listExtensionConnectFamilyMetadata(): ExtensionConnectFamilyMetadata[] {
	return Array.from(connectFamilyByIdentifier.entries())
		.map(([identifier, connectFamily]) => ({ identifier, connectFamily }))
		.sort((a, b) => a.identifier.localeCompare(b.identifier));
}

export function listIdentifiersByExtensionConnectFamily(
	family: ExtensionConnectFamily
): string[] {
	return listExtensionConnectFamilyMetadata()
		.filter((entry) => entry.connectFamily === family)
		.map((entry) => entry.identifier);
}
