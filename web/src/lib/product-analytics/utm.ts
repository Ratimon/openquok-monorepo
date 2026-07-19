import { browser } from '$app/environment';

const UTM_STORAGE_KEY = 'utm';
const LANDING_URL_KEY = 'landingUrl';
const REFERRER_KEY = 'referrer';

/** Query params used for attribution only — safe to strip from the visible URL after capture. */
const TRACKING_PARAM_NAMES = [
	'utm_source',
	'utm_medium',
	'utm_campaign',
	'utm_term',
	'utm_content',
	'utm',
	'ref',
	'gclid',
	'fbclid',
	'msclkid',
	'mc_cid',
	'mc_eid'
] as const;

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

export function stripTrackingSearchParams(searchParams: URLSearchParams): URLSearchParams {
	const next = new URLSearchParams(searchParams);
	for (const name of TRACKING_PARAM_NAMES) {
		next.delete(name);
	}
	return next;
}

/** Remove attribution-only params from the address bar after they are stored. */
export function replaceUrlWithoutTrackingParams(url: URL): void {
	if (!browser) return;

	const cleaned = stripTrackingSearchParams(url.searchParams);
	const nextSearch = cleaned.toString();
	const nextUrl = `${url.pathname}${nextSearch ? `?${nextSearch}` : ''}${url.hash}`;
	const currentUrl = `${url.pathname}${url.search}${url.hash}`;

	if (nextUrl !== currentUrl) {
		history.replaceState(history.state, '', nextUrl);
	}
}
