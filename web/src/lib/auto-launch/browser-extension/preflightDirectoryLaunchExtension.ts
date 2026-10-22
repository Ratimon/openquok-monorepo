import {
	isBrowserExtensionRuntimeAvailable,
	pingBrowserExtension
} from '$lib/integrations/browser-extension/extensionClient';
import { isBrowserExtensionConfigured } from '$lib/integrations/browser-extension/extensionConfig';

export type DirectoryLaunchExtensionPreflightResult =
	| { ok: true }
	| { ok: false; error: string };

/** Verify the OpenQuok extension is installed and reachable (no cookie read). */
export async function preflightDirectoryLaunchExtension(): Promise<DirectoryLaunchExtensionPreflightResult> {
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
	return { ok: true };
}
