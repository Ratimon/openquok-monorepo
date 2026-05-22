import { browser } from '$app/environment';

const UTM_STORAGE_KEY = 'utm';
const LANDING_URL_KEY = 'landingUrl';
const REFERRER_KEY = 'referrer';

export function readStoredUtm(): string {
	if (!browser) return '';
	try {
		return localStorage.getItem(UTM_STORAGE_KEY) ?? '';
	} catch {
		return '';
	}
}

export function storeUtmIfEmpty(utm: string): void {
	if (!browser || !utm) return;
	try {
		const existing = localStorage.getItem(UTM_STORAGE_KEY);
		if (!existing) {
			localStorage.setItem(UTM_STORAGE_KEY, utm);
		}
	} catch {
		/* ignore */
	}
}

export function captureLandingAttribution(): void {
	if (!browser) return;
	try {
		if (!localStorage.getItem(LANDING_URL_KEY)) {
			localStorage.setItem(LANDING_URL_KEY, window.location.href);
		}
		if (!localStorage.getItem(REFERRER_KEY)) {
			localStorage.setItem(REFERRER_KEY, document.referrer);
		}
	} catch {
		/* ignore */
	}
}

export function readUtmFromSearchParams(searchParams: URLSearchParams): string | null {
	return (
		searchParams.get('utm_source') ||
		searchParams.get('utm') ||
		searchParams.get('ref')
	);
}
