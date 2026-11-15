import { getApiBaseUrl } from '$lib/config/constants/apiBaseUrl';
import { parseBrowserExtensionIdsEnv } from '$lib/integrations/browser-extension/parseBrowserExtensionIdsEnv';
import { normalizeApiBaseUrl } from '$lib/utils/path';

/** Published OpenQuok listing on the Chrome Web Store (public ID). */
const OPENQUOK_BROWSER_EXTENSION_CHROME_WEB_STORE_ID = 'diloknijkhhggpfhenpoccnjbcjdoedn';

function readViteEnvString(key: string): string {
	if (typeof import.meta === 'undefined' || import.meta.env?.[key] === undefined) {
		return '';
	}
	return String(import.meta.env[key]).trim();
}

/** Legacy single extension ID (`VITE_OPENQUOK_BROWSER_EXTENSION_ID`). */
export function getBrowserExtensionLegacyId(): string {
	return readViteEnvString('VITE_OPENQUOK_BROWSER_EXTENSION_ID');
}

/**
 * Extension IDs to try when messaging the browser extension (multi-store builds ping in order).
 * Merges `VITE_OPENQUOK_BROWSER_EXTENSION_IDS` with the legacy single-ID env when present.
 */
export function getBrowserExtensionIdCandidates(): string[] {
	const fromMap = parseBrowserExtensionIdsEnv(readViteEnvString('VITE_OPENQUOK_BROWSER_EXTENSION_IDS'));
	const legacy = getBrowserExtensionLegacyId();
	if (fromMap.length === 0) {
		return legacy ? [legacy] : [];
	}
	if (legacy && !fromMap.includes(legacy)) {
		return [...fromMap, legacy];
	}
	return fromMap;
}

/** First configured candidate (sync). Use {@link resolveBrowserExtensionId} in the client for runtime ping. */
export function getBrowserExtensionId(): string {
	return getBrowserExtensionIdCandidates()[0] ?? '';
}

export function isBrowserExtensionConfigured(): boolean {
	return getBrowserExtensionIdCandidates().length > 0;
}

/** Public Chrome Web Store listing; prefers configured ID, else the published store ID. */
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
