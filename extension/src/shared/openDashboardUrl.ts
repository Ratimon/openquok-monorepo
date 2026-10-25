import { rememberDashboardOrigin } from './dashboardOriginStorage.js';

export const PRODUCTION_DASHBOARD_SIGN_IN_URL = 'https://www.openquok.com/sign-in';

/** Default self-host field value (Vite dev dashboard; `/api` proxies to the backend). */
export const DEFAULT_SELF_HOST_DASHBOARD_INPUT = 'localhost:5173';

/** Local Vite dev uses HTTPS when mkcert certs exist (see web/.env.development.example). */
export function preferHttpsLocalDevSignInUrl(rawUrl: string): string {
	try {
		const parsed = new URL(rawUrl);
		if (
			parsed.hostname === 'localhost' &&
			parsed.protocol === 'http:' &&
			(parsed.port === '5173' || parsed.port === '')
		) {
			parsed.protocol = 'https:';
			if (!parsed.port) parsed.port = '5173';
			return parsed.href;
		}
	} catch {
		/* keep rawUrl */
	}
	return rawUrl;
}

/**
 * Turns a host or origin from the self-host field into a dashboard sign-in URL.
 * Accepts `localhost:5173`, `https://my.example.com`, etc.
 */
export function parseDashboardSignInInput(raw: string): string | null {
	const trimmed = raw.trim();
	if (!trimmed) return null;

	let href = trimmed;
	if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(href)) {
		href = `https://${href}`;
	}

	try {
		const parsed = new URL(href);
		if (!parsed.hostname) return null;
		parsed.pathname = '/sign-in';
		parsed.search = '';
		parsed.hash = '';
		return preferHttpsLocalDevSignInUrl(parsed.href);
	} catch {
		return null;
	}
}

export async function openDashboardUrl(rawUrl: string): Promise<void> {
	const url = preferHttpsLocalDevSignInUrl(rawUrl);
	try {
		await rememberDashboardOrigin(new URL(url).origin);
	} catch {
		/* ignore */
	}
	await chrome.tabs.create({ url, active: true });
}
