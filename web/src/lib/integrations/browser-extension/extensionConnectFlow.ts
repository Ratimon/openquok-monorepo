import type { BrowserExtensionSessionCookie } from 'openquok-common';

import {
	fetchBrowserExtensionSessionCookies,
	isBrowserExtensionRuntimeAvailable,
	pingBrowserExtension
} from '$lib/integrations/browser-extension/extensionClient';
import { isBrowserExtensionConfigured } from '$lib/integrations/browser-extension/extensionConfig';

export type ExtensionConnectPreflightResult =
	| { ok: true; cookies: BrowserExtensionSessionCookie[] }
	| { ok: false; error: string };

/** PING the extension, then read session cookies for the provider. */
export async function preflightBrowserExtensionConnect(
	providerId: string
): Promise<ExtensionConnectPreflightResult> {
	if (!isBrowserExtensionConfigured()) {
		return {
			ok: false,
			error:
				'The OpenQuok browser extension is not configured for this environment. Install the extension and ask your operator to set VITE_OPENQUOK_BROWSER_EXTENSION_ID.'
		};
	}
	if (!isBrowserExtensionRuntimeAvailable()) {
		return {
			ok: false,
			error:
				'Could not reach the OpenQuok browser extension. Install it in Chrome, pin it, and use this dashboard in the same browser profile.'
		};
	}
	const ping = await pingBrowserExtension();
	if (!ping.ok) {
		return {
			ok: false,
			error: ping.error || 'The OpenQuok browser extension did not respond.'
		};
	}
	const cookiesResult = await fetchBrowserExtensionSessionCookies(providerId);
	if (!cookiesResult.ok) {
		return { ok: false, error: cookiesResult.error };
	}
	return { ok: true, cookies: cookiesResult.cookies };
}
