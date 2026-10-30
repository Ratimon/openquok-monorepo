import {
	getExtensionConnectFamily,
	listIdentifiersByExtensionConnectFamily,
} from 'openquok-common';

/**
 * Where the extension (or orchestrator) sends a scheduled post for a channel.
 * v1: always {@link SocialPublishPath.server} for the Social tab composer.
 */
export type SocialPublishPath = 'server' | 'browser';

export type BrowserPublishRequest = {
	integrationId: string;
	providerIdentifier: string;
	body: string;
	scheduledAtIso: string;
};

export type BrowserPublishFailureCode = 'not_implemented' | 'unsupported' | 'cancelled';

export type BrowserPublishResult =
	| { ok: true; externalPostId?: string }
	| { ok: false; error: string; code: BrowserPublishFailureCode };

/**
 * Phase-2 hook for in-browser send: automation in a live platform tab
 * using the member's browser session (no platform OAuth inside the extension).
 */
export type BrowserPublishPort = {
	supportsProvider(providerIdentifier: string): boolean;
	publish(request: BrowserPublishRequest): Promise<BrowserPublishResult>;
};

/** Provider identifiers planned for {@link BrowserPublishPort} (Skool first). */
export const BROWSER_PUBLISH_CANDIDATE_PROVIDER_IDS: readonly string[] =
	listIdentifiersByExtensionConnectFamily('cookie_session');

export function isBrowserPublishCandidate(providerIdentifier: string): boolean {
	return getExtensionConnectFamily(providerIdentifier) === 'cookie_session';
}

/**
 * v1 publish path for the side panel Social composer.
 * Server path uses encrypted session cookies + orchestrator (today's Skool flow).
 */
export function socialPublishPathForProvider(_providerIdentifier: string): SocialPublishPath {
	return 'server';
}

export const NOT_IMPLEMENTED_BROWSER_PUBLISH: BrowserPublishResult = {
	ok: false,
	code: 'not_implemented',
	error:
		'In-browser send is not available yet. OpenQuok publishes through the API using your connected session.',
};

/**
 * Stub port registered until cookie-session adapters ship.
 * {@link createSocialPost} and the orchestrator remain the v1 path.
 */
export const stubBrowserPublishPort: BrowserPublishPort = {
	supportsProvider: (providerIdentifier) => isBrowserPublishCandidate(providerIdentifier),
	publish: async () => NOT_IMPLEMENTED_BROWSER_PUBLISH,
};

let activeBrowserPublishPort: BrowserPublishPort = stubBrowserPublishPort;

/** Test-only: replace the active port (restores stub when omitted). */
export function setBrowserPublishPortForTests(port?: BrowserPublishPort): void {
	activeBrowserPublishPort = port ?? stubBrowserPublishPort;
}

export function getBrowserPublishPort(): BrowserPublishPort {
	return activeBrowserPublishPort;
}
