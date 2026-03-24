// Purpose: Store for managing the cookie consent

import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { getValue, storeValue, removeValue, StorageType } from '$lib/utils/storage-utils';

const COOKIE_CONSENT_KEY = 'cookie-consent';

/**
 * Get initial cookie consent state from localStorage
 */
function getInitialState(): boolean | null {
	if (!browser) return null;
	const stored = getValue<boolean>(COOKIE_CONSENT_KEY, StorageType.LOCAL);
	return stored ?? null;
}

/**
 * Create cookie consent store
 */
function createCookieConsentStore() {
	const { subscribe, set } = writable<boolean | null>(getInitialState());

	return {
		subscribe,
		setCookieConsent: (hasConsent: boolean | null) => {
			if (browser) {
				if (hasConsent === null) {
					removeValue(COOKIE_CONSENT_KEY, StorageType.LOCAL);
				} else {
					storeValue(COOKIE_CONSENT_KEY, hasConsent, StorageType.LOCAL);
				}
			}
			set(hasConsent);
		}
	};
}

export const cookieConsentStore = createCookieConsentStore();
