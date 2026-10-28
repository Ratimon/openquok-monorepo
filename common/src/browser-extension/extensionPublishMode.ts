import { getCookieSessionProvider } from './cookieSessionProviders.js';

/**
 * How a chrome-extension social channel publishes at schedule time.
 * - `server_api`: orchestrator calls `social.post()` with stored session cookies (Skool).
 * - `member_browser_handoff`: member completes submit in the browser; no server publish (Reddit).
 */
export type ExtensionPublishMode = 'server_api' | 'member_browser_handoff';

export const DEFAULT_EXTENSION_PUBLISH_MODE: ExtensionPublishMode = 'server_api';

export type ExtensionPublishModeInput = {
	identifier?: string;
	isChromeExtension?: boolean;
	extensionPublishMode?: ExtensionPublishMode;
};

/**
 * Resolves publish mode for a social provider.
 * Explicit `extensionPublishMode` wins, then the cookie-session catalog, then `server_api` for
 * chrome-extension providers.
 */
export function resolveExtensionPublishMode(
	input: ExtensionPublishModeInput
): ExtensionPublishMode | undefined {
	if (input.extensionPublishMode) {
		return input.extensionPublishMode;
	}
	const id = input.identifier?.trim().toLowerCase();
	if (id) {
		const cookieProvider = getCookieSessionProvider(id);
		if (cookieProvider) {
			return cookieProvider.publishMode;
		}
	}
	if (input.isChromeExtension) {
		return DEFAULT_EXTENSION_PUBLISH_MODE;
	}
	return undefined;
}
