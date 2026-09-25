import { browser, dev } from '$app/environment';

import {
	CLOUD_TRIAL_BROWSER_COOKIE_MAX_AGE_SECONDS,
	CLOUD_TRIAL_BROWSER_COOKIE_NAME
} from '$lib/billing/constants/cloudTrialBrowserSignal';

const UUID_V4_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readCookie(name: string): string | null {
	if (typeof document === 'undefined') return null;
	const prefix = `${name}=`;
	for (const segment of document.cookie.split(';')) {
		const trimmed = segment.trim();
		if (trimmed.startsWith(prefix)) {
			return decodeURIComponent(trimmed.slice(prefix.length));
		}
	}
	return null;
}

function isUuidV4(value: string): boolean {
	return UUID_V4_RE.test(value);
}

function writeCookie(value: string): void {
	const secure = dev ? '' : '; Secure';
	document.cookie = `${CLOUD_TRIAL_BROWSER_COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; Max-Age=${CLOUD_TRIAL_BROWSER_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

/** Returns a validated signal from the cookie, or null when absent or invalid. */
export function getCloudTrialBrowserSignalId(): string | null {
	if (!browser) return null;
	const raw = readCookie(CLOUD_TRIAL_BROWSER_COOKIE_NAME);
	if (raw && isUuidV4(raw)) return raw;
	return null;
}

/** Ensures the browser cookie exists and returns its UUID (client-only). */
export function ensureCloudTrialBrowserSignal(): string | null {
	if (!browser) return null;
	const existing = getCloudTrialBrowserSignalId();
	if (existing) return existing;
	const id = crypto.randomUUID();
	writeCookie(id);
	return id;
}

/** Optional JSON field for auth/billing POST bodies (camelCase API). */
export function cloudTrialBrowserSignalRequestField(): {
	cloudTrialBrowserSignalId?: string;
} {
	const id = ensureCloudTrialBrowserSignal();
	return id ? { cloudTrialBrowserSignalId: id } : {};
}
