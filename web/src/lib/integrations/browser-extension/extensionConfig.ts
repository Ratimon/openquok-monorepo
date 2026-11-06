import { getApiBaseUrl } from '$lib/config/constants/apiBaseUrl';
import { normalizeApiBaseUrl } from '$lib/utils/path';

/** Published OpenQuok listing on the Chrome Web Store (public ID). */
const OPENQUOK_BROWSER_EXTENSION_CHROME_WEB_STORE_ID = 'diloknijkhhggpfhenpoccnjbcjdoedn';

/** Chrome extension ID for `chrome.runtime.sendMessage` (from Web Store or unpacked build). */
export function getBrowserExtensionId(): string {
	const raw =
		typeof import.meta !== 'undefined' && import.meta.env?.VITE_OPENQUOK_BROWSER_EXTENSION_ID !== undefined
			? String(import.meta.env.VITE_OPENQUOK_BROWSER_EXTENSION_ID)
			: '';
	return raw.trim();
}

export function isBrowserExtensionConfigured(): boolean {
	return getBrowserExtensionId().length > 0;
}

/** Public Chrome Web Store listing; prefers `VITE_OPENQUOK_BROWSER_EXTENSION_ID`, else the published store ID. */
export function getBrowserExtensionChromeWebStoreListingUrl(): string {
	const id = getBrowserExtensionId() || OPENQUOK_BROWSER_EXTENSION_CHROME_WEB_STORE_ID;
	return `https://chromewebstore.google.com/detail/openquok/${id}`;
}

/**
 * Origin the extension uses for `POST /api/v1/integrations/extension-refresh`
 * (see extension `apiRoot` — appends `/api/v1` to this value).
 */
export function getBrowserExtensionBackendUrl(): string {
	const apiBase = getApiBaseUrl();
	if (apiBase) {
		return normalizeApiBaseUrl(apiBase);
	}
	if (typeof window !== 'undefined' && window.location?.origin) {
		return normalizeApiBaseUrl(window.location.origin);
	}
	return '';
}
