import { listAuthCheckOrigins } from './dashboardApiOrigin.js';
import {
	isLocalDashboardOrigin,
	listOpenDashboardTabOrigins,
	readDashboardOriginFromUrl,
} from './dashboardActiveTab.js';
import { findDashboardBridgeSession } from './dashboardBridgeStorage.js';
import { hasDashboardSessionCookie, isDashboardLoggedIn } from './dashboardAuth.js';
import {
	getPreferredDashboardOrigin,
	listDashboardOriginCandidates,
} from './dashboardOriginStorage.js';
import { listPausedSocialDashboardOrigins } from './dashboardSocialDisconnect.js';

function dashboardOriginFromSignInUrl(loginUrl: string): string {
	return loginUrl.replace(/\/sign-in\/?$/, '');
}

function orderLocalDashboardOriginsFirst(origins: string[]): string[] {
	const locals: string[] = [];
	const rest: string[] = [];
	const seen = new Set<string>();
	for (const raw of origins) {
		const trimmed = raw.trim();
		if (!trimmed || seen.has(trimmed)) continue;
		seen.add(trimmed);
		if (isLocalDashboardOrigin(trimmed)) locals.push(trimmed);
		else rest.push(trimmed);
	}
	return [...locals, ...rest];
}

/** Local Vite session or bridge wins over a stale production cookie when picking the Humanizer host. */
async function resolveSignedInDashboardOriginPreferringLocal(): Promise<string | null> {
	const checkOrigins = orderLocalDashboardOriginsFirst([
		...(await listOpenDashboardTabOrigins()),
		...(await listDashboardOriginCandidates()),
		...(await listAuthCheckOrigins()),
	]);
	const pausedOrigins = await listPausedSocialDashboardOrigins();

	for (const origin of checkOrigins) {
		if (pausedOrigins.has(origin)) continue;
		if (await hasDashboardSessionCookie(origin)) return origin;
	}

	const bridge = await findDashboardBridgeSession(checkOrigins);
	return bridge?.dashboardOrigin ?? null;
}

/**
 * Picks the Humanizer host: active dashboard tab, open local Vite, signed-in dashboard, then remembered origin.
 */
export async function resolveDashboardOriginForHumanizerTab(): Promise<string> {
	if (typeof chrome !== 'undefined' && typeof chrome.tabs?.query === 'function') {
		const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
		const activeUrl = activeTab?.url;
		if (activeUrl) {
			const fromActive = readDashboardOriginFromUrl(activeUrl);
			if (fromActive) return fromActive;
		}
	}

	const openOrigins = await listOpenDashboardTabOrigins();
	const localOpen = openOrigins.find(isLocalDashboardOrigin);
	if (localOpen) return localOpen;

	const signedInOrigin = await resolveSignedInDashboardOriginPreferringLocal();
	if (signedInOrigin) return signedInOrigin;

	const auth = await isDashboardLoggedIn();
	if (auth.loggedIn) {
		return dashboardOriginFromSignInUrl(auth.loginUrl);
	}

	const openFallback = openOrigins.find(isLocalDashboardOrigin) ?? openOrigins[0];
	if (openFallback) return openFallback;

	const preferred = await getPreferredDashboardOrigin();
	if (isLocalDashboardOrigin(preferred)) return preferred;

	const candidates = await listDashboardOriginCandidates();
	const rememberedLocal = candidates.find(isLocalDashboardOrigin);
	if (rememberedLocal) return rememberedLocal;

	return preferred;
}

const PUBLIC_HUMANIZER_PATH = '/tools/humanizer';

/** Must match `HUMANIZER_PREFILL_QUERY_PARAM` on the web Humanizer page. */
export const PUBLIC_HUMANIZER_PREFILL_QUERY_PARAM = 'text';

/** Max selection length encoded into the Humanizer URL. */
export const PUBLIC_HUMANIZER_PREFILL_MAX_CHARS = 2200;

export function coercePublicHumanizerPrefillText(selection: string): string | null {
	const trimmed = selection.trim();
	if (!trimmed) return null;
	if (trimmed.length > PUBLIC_HUMANIZER_PREFILL_MAX_CHARS) {
		return trimmed.slice(0, PUBLIC_HUMANIZER_PREFILL_MAX_CHARS);
	}
	return trimmed;
}

/** Builds the public Humanizer route on a dashboard host; optional `text` query prefill. */
export function buildPublicHumanizerUrl(dashboardOrigin: string, selectionText?: string): string {
	const trimmed = dashboardOrigin.trim();
	let origin = trimmed;
	try {
		origin = new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`).origin;
	} catch {
		origin = trimmed.replace(/\/+$/, '');
	}
	const url = new URL(`${origin.replace(/\/+$/, '')}${PUBLIC_HUMANIZER_PATH}`);
	const prefill = selectionText ? coercePublicHumanizerPrefillText(selectionText) : null;
	if (prefill) {
		url.searchParams.set(PUBLIC_HUMANIZER_PREFILL_QUERY_PARAM, prefill);
	}
	return url.href;
}

/** Opens `/tools/humanizer` on the remembered dashboard origin in a new tab. */
export async function openPublicHumanizerTab(selectionText?: string): Promise<void> {
	const dashboardOrigin = await resolveDashboardOriginForHumanizerTab();
	const url = buildPublicHumanizerUrl(dashboardOrigin, selectionText);
	await chrome.tabs.create({ url, active: true });
}
