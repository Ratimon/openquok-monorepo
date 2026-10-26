import { clearPausedSocialDashboardOrigin } from './dashboardSocialDisconnect.js';
import { rememberDashboardOrigin } from './dashboardOriginStorage.js';

export const PRODUCTION_DASHBOARD_SIGN_IN_URL = 'https://www.openquok.com/sign-in';

/** Default self-host field value (Vite dev dashboard; `/api` proxies to the backend). */
export const DEFAULT_SELF_HOST_DASHBOARD_INPUT = 'https://localhost:5173';

const LOCAL_VITE_DEV_PORT = '5173';

function isLocalhostHostname(hostname: string): boolean {
	return hostname.toLowerCase() === 'localhost';
}

/** True for values like `5173` (port only). */
function isBarePort(value: string): boolean {
	return /^\d{1,5}$/.test(value);
}

/**
 * Ensures a user-typed URL has a valid http(s) scheme (aligned with web `normalizeHttpUrlInput`).
 */
function normalizeHttpUrlInput(raw: string): string {
	const url = raw.trim();
	if (!url) return '';

	const schemeMissingSlashes = url.match(/^(https?):([^/].+)$/i);
	if (schemeMissingSlashes) {
		return `${schemeMissingSlashes[1].toLowerCase()}://${schemeMissingSlashes[2]}`;
	}

	if (/^https?:\/\//i.test(url)) return url;
	return `https://${url}`;
}

/** Local Vite dev uses HTTPS when mkcert certs exist (see web/.env.development.example). */
export function preferHttpsLocalDevSignInUrl(rawUrl: string): string {
	try {
		const parsed = new URL(rawUrl);
		if (
			isLocalhostHostname(parsed.hostname) &&
			parsed.protocol === 'http:' &&
			(parsed.port === LOCAL_VITE_DEV_PORT || parsed.port === '')
		) {
			parsed.protocol = 'https:';
			if (!parsed.port) parsed.port = LOCAL_VITE_DEV_PORT;
			return parsed.href;
		}
	} catch {
		/* keep rawUrl */
	}
	return rawUrl;
}

function preferHttpsLocalDevOrigin(origin: string): string {
	try {
		const parsed = new URL(origin);
		if (
			isLocalhostHostname(parsed.hostname) &&
			parsed.protocol === 'http:' &&
			(parsed.port === LOCAL_VITE_DEV_PORT || parsed.port === '')
		) {
			parsed.protocol = 'https:';
			if (!parsed.port) parsed.port = LOCAL_VITE_DEV_PORT;
			return parsed.origin;
		}
		return parsed.origin;
	} catch {
		return origin;
	}
}

/**
 * Normalizes the self-host dashboard field (blur / connect), mirroring Bluesky link URL fields in the web app.
 * Bare `5173` becomes `https://localhost:5173`; `localhost:5173` gains `https://`.
 */
export function normalizeSelfHostDashboardInput(raw: string): string {
	const trimmed = raw.trim();
	if (!trimmed) return DEFAULT_SELF_HOST_DASHBOARD_INPUT;

	if (isBarePort(trimmed)) {
		return preferHttpsLocalDevOrigin(`https://localhost:${trimmed}`);
	}

	if (/^127\.0\.0\.1(:\d+)?$/i.test(trimmed)) {
		return normalizeHttpUrlInput(trimmed).replace(/\/$/, '');
	}

	const withScheme = normalizeHttpUrlInput(trimmed);

	try {
		const parsed = new URL(withScheme);
		if (isBarePort(parsed.hostname)) {
			const port = parsed.hostname;
			return preferHttpsLocalDevOrigin(`https://localhost:${port}`);
		}
		if (!parsed.hostname) return DEFAULT_SELF_HOST_DASHBOARD_INPUT;
		parsed.pathname = '/';
		parsed.search = '';
		parsed.hash = '';
		return preferHttpsLocalDevOrigin(parsed.origin);
	} catch {
		return DEFAULT_SELF_HOST_DASHBOARD_INPUT;
	}
}

/**
 * Turns a host or origin from the self-host field into a dashboard sign-in URL.
 */
export function parseDashboardSignInInput(raw: string): string | null {
	const origin = normalizeSelfHostDashboardInput(raw);
	if (!origin) return null;

	try {
		const parsed = new URL(origin.includes('://') ? origin : `https://${origin}`);
		if (!parsed.hostname) return null;
		parsed.pathname = '/sign-in';
		parsed.search = '';
		parsed.hash = '';
		return preferHttpsLocalDevSignInUrl(parsed.href);
	} catch {
		return null;
	}
}

const PRODUCTION_CONNECT_KEY = 'openquok:production';

function isLocalViteDashboardHost(hostname: string, port: string): boolean {
	const host = hostname.toLowerCase();
	return (host === 'localhost' || host === '127.0.0.1') && (port === LOCAL_VITE_DEV_PORT || port === '');
}

function isProductionOpenQuokHost(hostname: string): boolean {
	const host = hostname.toLowerCase();
	return host === 'openquok.com' || host.endsWith('.openquok.com');
}

/**
 * Stable key for comparing “already on this dashboard” vs a connect/sign-in target.
 */
export function dashboardConnectTargetKey(rawUrl: string): string | null {
	try {
		const parsed = new URL(rawUrl.includes('://') ? rawUrl : `https://${rawUrl}`);
		if (!parsed.hostname) return null;

		if (isLocalViteDashboardHost(parsed.hostname, parsed.port)) {
			return preferHttpsLocalDevOrigin(`https://${parsed.hostname}:${parsed.port || LOCAL_VITE_DEV_PORT}`);
		}
		if (isProductionOpenQuokHost(parsed.hostname)) {
			return PRODUCTION_CONNECT_KEY;
		}
		return preferHttpsLocalDevOrigin(parsed.origin);
	} catch {
		return null;
	}
}

/** True when the tab URL is the same OpenQuok dashboard environment as the connect target. */
export function activeTabMatchesDashboardConnectTarget(
	tabUrl: string,
	targetSignInUrl: string
): boolean {
	const tabKey = dashboardConnectTargetKey(tabUrl);
	const targetKey = dashboardConnectTargetKey(targetSignInUrl);
	return Boolean(tabKey && targetKey && tabKey === targetKey);
}

async function focusActiveTabIfAlreadyOnDashboard(targetSignInUrl: string): Promise<boolean> {
	if (typeof chrome === 'undefined' || typeof chrome.tabs?.query !== 'function') {
		return false;
	}
	const [active] = await chrome.tabs.query({ active: true, currentWindow: true });
	if (!active?.id || !active.url) return false;
	if (!activeTabMatchesDashboardConnectTarget(active.url, targetSignInUrl)) return false;
	await chrome.tabs.update(active.id, { active: true });
	return true;
}

export async function openDashboardUrl(rawUrl: string): Promise<void> {
	const signInUrl = parseDashboardSignInInput(rawUrl) ?? preferHttpsLocalDevSignInUrl(rawUrl);
	try {
		const origin = new URL(signInUrl).origin;
		await rememberDashboardOrigin(origin);
		await clearPausedSocialDashboardOrigin(origin);
	} catch {
		/* ignore */
	}
	if (await focusActiveTabIfAlreadyOnDashboard(signInUrl)) return;
	await chrome.tabs.create({ url: signInUrl, active: true });
}
