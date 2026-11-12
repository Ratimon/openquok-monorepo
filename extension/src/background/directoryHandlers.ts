import {
	AUTO_LAUNCH_MESSAGE_TYPE,
	getDirectoryLaunchProvider,
	resolveDirectoryLaunchStartUrl,
	toAutoLaunchHandoffSession,
	type AutoLaunchHandoffRequestFields,
	type AutoLaunchHandoffSession,
	type AutoLaunchProgressPayload,
} from 'openquok-common';

import { CHECK_DIRECTORY_GATE_MESSAGE } from '../directory/directory-launch/directoryGate.js';
import { postCompleteSubmission } from '../directory/auto-launch/openquokApi.js';
import { fetchOrganizationProductProfiles } from '../directory/auto-launch/fetchOrganizationProfiles.js';
import {
	buildDirectoryProfileSourceOptions,
} from '../directory/auto-launch/profileSourceOptions.js';
import {
	applyStoredDirectoryLaunchProfileRefresh,
	postRefreshSubmissionIntent,
	refreshStoredDirectoryLaunchProfile,
} from '../directory/auto-launch/refreshDirectoryLaunchProfile.js';
import { buildDirectoryLaunchHandoffFromSite } from '../directory/auto-launch/startDirectoryLaunchFromSite.js';
import {
	dashboardSignInUrl,
	hasDashboardSessionCookie,
	isDashboardLoggedIn,
	readAccessTokenCookie,
} from '../shared/dashboardAuth.js';
import {
	POPUP_UI_MESSAGE,
	type PopupUiMessage,
} from '../directory/auto-launch/popupMessages.js';
import {
	OPENQUOK_AUTO_LAUNCH_DISMISS_PANEL,
	OPENQUOK_AUTO_LAUNCH_FOCUS_TAB,
	OPENQUOK_AUTO_LAUNCH_OPEN_DIRECTORY_PAGE,
	OPENQUOK_AUTO_LAUNCH_PEEK_PROFILE_SNAPSHOT,
	OPENQUOK_AUTO_LAUNCH_PROFILE_SOURCES,
	OPENQUOK_AUTO_LAUNCH_RESET_PANEL_POSITION,
	OPENQUOK_AUTO_LAUNCH_SHOW_PANEL,
	OPENQUOK_AUTO_LAUNCH_SWITCH_PROFILE_SOURCE,
} from '../directory/auto-launch/constants.js';
import {
	clearAutoLaunchState,
	loadAutoLaunchState,
	saveAutoLaunchState,
	type StoredAutoLaunchState,
} from '../directory/auto-launch/sessionStorage.js';

function dashboardOriginFromSenderUrl(senderUrl?: string): string | null {
	if (!senderUrl) return null;
	try {
		return new URL(senderUrl).origin;
	} catch {
		return null;
	}
}

function startUrlMatchPrefix(startUrl: string): string {
	try {
		const parsed = new URL(startUrl);
		return `${parsed.origin}${parsed.pathname}`;
	} catch {
		return startUrl.split('?')[0]?.split('#')[0] ?? startUrl;
	}
}

function tabMatchesStartUrl(tabUrl: string, startUrl: string, prefix: string): boolean {
	if (tabUrl === startUrl || tabUrl.startsWith(prefix)) return true;
	try {
		const normalized = new URL(tabUrl);
		const target = new URL(startUrl);
		return (
			normalized.origin === target.origin &&
			normalized.pathname === target.pathname
		);
	} catch {
		return false;
	}
}

async function findTabIdForStartUrl(startUrl: string): Promise<number | null> {
	const prefix = startUrlMatchPrefix(startUrl);
	const tabs = await chrome.tabs.query({});
	for (const tab of tabs) {
		if (typeof tab.id !== 'number' || !tab.url) continue;
		if (tabMatchesStartUrl(tab.url, startUrl, prefix)) {
			return tab.id;
		}
	}
	return null;
}

async function findTabIdForStartUrlWithRetry(
	startUrl: string,
	attempts = 12,
	delayMs = 100
): Promise<number | null> {
	for (let attempt = 0; attempt < attempts; attempt += 1) {
		const tabId = await findTabIdForStartUrl(startUrl);
		if (tabId !== null) return tabId;
		if (attempt < attempts - 1) {
			await new Promise((resolve) => setTimeout(resolve, delayMs));
		}
	}
	return null;
}

/** Any open tab whose URL matches directory host patterns (for side-panel channel pick). */
async function findTabIdForHostPatterns(patterns: readonly string[]): Promise<number | null> {
	if (patterns.length === 0) return null;
	const tabs = await chrome.tabs.query({});
	for (const tab of tabs) {
		if (typeof tab.id !== 'number' || !tab.url) continue;
		if (tabUrlMatchesHostPatterns(tab.url, patterns)) {
			return tab.id;
		}
	}
	return null;
}

/**
 * Reuse an existing directory tab, or open `startUrl` when the user starts from the side panel.
 */
async function resolveDirectoryTabForLaunch(
	startUrl: string,
	hostPatterns: readonly string[]
): Promise<{ tabId: number; created: boolean } | null> {
	const existing =
		(await findTabIdForStartUrlWithRetry(startUrl, 4, 80)) ??
		(await findTabIdForHostPatterns(hostPatterns));
	if (existing !== null) {
		return { tabId: existing, created: false };
	}
	const tab = await chrome.tabs.create({ url: startUrl, active: true });
	if (typeof tab.id !== 'number') return null;
	return { tabId: tab.id, created: true };
}

async function sendStartToTab(
	tabId: number,
	session: AutoLaunchHandoffSession,
	dashboardOrigin?: string
): Promise<void> {
	try {
		await chrome.tabs.sendMessage(tabId, {
			type: AUTO_LAUNCH_MESSAGE_TYPE.START,
			session,
			...(dashboardOrigin ? { dashboardOrigin } : {}),
		});
	} catch {
		/* content script loads after navigation — attach listener will retry */
	}
}

async function sendStartToTabWithStoredOrigin(
	tabId: number,
	session: AutoLaunchHandoffSession
): Promise<void> {
	const state = await loadAutoLaunchState();
	await sendStartToTab(tabId, session, state?.dashboardOrigin);
}

async function dismissLaunchPanelOnTab(tabId: number | null | undefined): Promise<void> {
	if (tabId == null) return;
	try {
		await chrome.tabs.sendMessage(tabId, { type: OPENQUOK_AUTO_LAUNCH_DISMISS_PANEL });
	} catch {
		/* tab closed or content script not on this host */
	}
}

async function setHandoffTabId(tabId: number): Promise<void> {
	const state = await loadAutoLaunchState();
	if (!state) return;
	if (state.handoffTabId === tabId) return;
	await saveAutoLaunchState({ ...state, handoffTabId: tabId });
}

function attachAutoLaunchStartWhenTabReady(tabId: number, session: AutoLaunchHandoffSession): void {
	void setHandoffTabId(tabId);
	const onUpdated = (updatedTabId: number, info: chrome.tabs.TabChangeInfo) => {
		if (updatedTabId !== tabId || info.status !== 'complete') return;
		void sendStartToTabWithStoredOrigin(tabId, session);
	};
	chrome.tabs.onUpdated.addListener(onUpdated);
	void chrome.tabs.get(tabId).then((tab) => {
		if (tab.status === 'complete') {
			void sendStartToTabWithStoredOrigin(tabId, session);
		}
	});
}

function ensureHandoffTabNavigationWatcher(): void {
	if (handoffTabWatcherRegistered) return;
	handoffTabWatcherRegistered = true;

	chrome.tabs.onCreated.addListener((tab) => {
		if (typeof tab.id !== 'number' || !tab.openerTabId) return;
		void (async () => {
			const state = await loadAutoLaunchState();
			if (!state?.session) return;
			if (state.handoffTabId !== tab.openerTabId) return;
			const adopt = async (tabId: number, url?: string) => {
				if (!url || !tabUrlMatchesSession(url, state.session)) return;
				await saveAutoLaunchState({ ...state, handoffTabId: tabId });
				const onReady = (updatedId: number, info: chrome.tabs.TabChangeInfo) => {
					if (updatedId !== tabId || info.status !== 'complete') return;
					chrome.tabs.onUpdated.removeListener(onReady);
					void sendStartToTab(tabId, state.session, state.dashboardOrigin);
				};
				chrome.tabs.onUpdated.addListener(onReady);
			};
			if (tab.url) {
				await adopt(tab.id, tab.url);
			} else {
				const onUrl = (updatedId: number, info: chrome.tabs.TabChangeInfo) => {
					if (updatedId !== tab.id || !info.url) return;
					chrome.tabs.onUpdated.removeListener(onUrl);
					void adopt(tab.id, info.url);
				};
				chrome.tabs.onUpdated.addListener(onUrl);
			}
		})();
	});

	chrome.tabs.onUpdated.addListener((tabId, info) => {
		if (info.status !== 'complete') return;
		void (async () => {
			const state = await loadAutoLaunchState();
			if (!state?.session) return;
			const trackedId = state.handoffTabId;
			if (trackedId != null && tabId !== trackedId) return;
			const tab = await chrome.tabs.get(tabId);
			if (!tab.url || !tabUrlMatchesSession(tab.url, state.session)) return;
			if (trackedId == null) {
				await saveAutoLaunchState({ ...state, handoffTabId: tabId });
			}
			await sendStartToTab(tabId, state.session, state.dashboardOrigin);
		})();
	});
}

let handoffTabWatcherRegistered = false;

function tabUrlMatchesSession(tabUrl: string, session: AutoLaunchHandoffSession): boolean {
	const patterns = session.extensionConfig.startUrlPatterns ?? [];
	if (patterns.length === 0) {
		return tabUrl.startsWith(session.startUrl) || tabUrl.includes(session.startUrl);
	}
	return tabUrlMatchesHostPatterns(tabUrl, patterns);
}

function tabUrlMatchesHostPatterns(tabUrl: string, patterns: readonly string[]): boolean {
	return patterns.some((pattern) => {
		try {
			const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
			return new RegExp(`^${escaped}$`, 'i').test(tabUrl);
		} catch {
			return tabUrl.includes(pattern.replace(/\*/g, ''));
		}
	});
}

async function openStartUrlForSession(
	session: AutoLaunchHandoffSession,
	fields: AutoLaunchHandoffRequestFields
): Promise<void> {
	if (!session.startUrl) return;

	if (fields.skipStartUrlTabOpen === true) {
		const existingTabId = await findTabIdForStartUrlWithRetry(session.startUrl);
		if (existingTabId !== null) {
			attachAutoLaunchStartWhenTabReady(existingTabId, session);
		} else {
			const tab = await chrome.tabs.create({ url: session.startUrl, active: false });
			if (typeof tab.id === 'number') {
				attachAutoLaunchStartWhenTabReady(tab.id, session);
			}
		}
		return;
	}

	const tab = await chrome.tabs.create({ url: session.startUrl, active: false });
	if (typeof tab.id === 'number') {
		attachAutoLaunchStartWhenTabReady(tab.id, session);
	}
}

export async function persistHandoff(
	fields: AutoLaunchHandoffRequestFields,
	senderUrl?: string
): Promise<{ submissionId: string }> {
	const origin = dashboardOriginFromSenderUrl(senderUrl);
	if (!origin) {
		throw new Error('Could not determine dashboard origin for handoff.');
	}

	const session = toAutoLaunchHandoffSession(fields);
	const state: StoredAutoLaunchState = {
		session,
		dashboardOrigin: origin,
		receivedAt: Date.now(),
	};
	ensureHandoffTabNavigationWatcher();
	await saveAutoLaunchState(state);
	broadcastPopup({ type: POPUP_UI_MESSAGE.STATE_CHANGED, state });

	await openStartUrlForSession(session, fields);

	return { submissionId: session.submissionId };
}

/** Attach an in-tab launch without opening `startUrl` in a new tab (directory-first flow). */
export async function persistHandoffForTab(
	fields: AutoLaunchHandoffRequestFields,
	dashboardOrigin: string,
	tabId: number
): Promise<{ submissionId: string }> {
	const session = toAutoLaunchHandoffSession(fields);
	const state: StoredAutoLaunchState = {
		session,
		dashboardOrigin,
		receivedAt: Date.now(),
		handoffTabId: tabId,
	};
	ensureHandoffTabNavigationWatcher();
	await saveAutoLaunchState(state);
	broadcastPopup({ type: POPUP_UI_MESSAGE.STATE_CHANGED, state });
	await sendStartToTab(tabId, session, dashboardOrigin);
	return { submissionId: session.submissionId };
}

function broadcastPopup(message: PopupUiMessage): void {
	void chrome.runtime.sendMessage(message).catch(() => {
		/* popup may be closed */
	});
}

async function activeTabId(): Promise<number | null> {
	const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
	const tab = tabs[0];
	return typeof tab?.id === 'number' ? tab.id : null;
}

async function focusStoredLaunchTab(
	state: StoredAutoLaunchState
): Promise<{ ok: true } | { ok: false; error: string }> {
	let tabId = state.handoffTabId ?? null;
	if (tabId != null) {
		try {
			await chrome.tabs.get(tabId);
		} catch {
			tabId = null;
		}
	}
	if (tabId == null && state.session.startUrl) {
		tabId = await findTabIdForStartUrlWithRetry(state.session.startUrl, 8, 100);
		if (tabId != null) {
			await saveAutoLaunchState({ ...state, handoffTabId: tabId });
		}
	}
	if (tabId == null) {
		return {
			ok: false,
			error: 'No directory tab found. Open the directory site for this launch.',
		};
	}
	await sendStartToTab(tabId, state.session, state.dashboardOrigin);
	await chrome.tabs.update(tabId, { active: true });
	const tab = await chrome.tabs.get(tabId);
	if (tab.windowId != null) {
		await chrome.windows.update(tab.windowId, { focused: true });
	}
	return { ok: true };
}

async function startDirectoryChannelFromSidePanel(
	providerSlugHint: string
): Promise<{ ok: true } | { ok: false; error: string }> {
	const provider = getDirectoryLaunchProvider(providerSlugHint);
	if (!provider) {
		return { ok: false, error: 'Unknown directory channel.' };
	}

	const handoff = await buildDirectoryLaunchHandoffFromSite(providerSlugHint);
	if (!handoff.ok) {
		return { ok: false, error: handoff.error };
	}

	const priorState = await loadAutoLaunchState();
	const priorHandoffTabId = priorState?.handoffTabId ?? null;

	const startUrl =
		resolveDirectoryLaunchStartUrl(providerSlugHint, handoff.fields.startUrl) ||
		provider.defaultStartUrl;
	const tabResolution = await resolveDirectoryTabForLaunch(startUrl, provider.hostPatterns);
	if (!tabResolution) {
		return { ok: false, error: 'Could not open a directory tab for this launch.' };
	}
	const { tabId } = tabResolution;

	const prefix = startUrlMatchPrefix(startUrl);
	let tab = await chrome.tabs.get(tabId);
	const urlMatchesStart =
		typeof tab.url === 'string' && tabMatchesStartUrl(tab.url, startUrl, prefix);
	if (!urlMatchesStart) {
		await chrome.tabs.update(tabId, { url: startUrl });
		tab = await chrome.tabs.get(tabId);
	}

	if (priorHandoffTabId != null && priorHandoffTabId !== tabId) {
		await dismissLaunchPanelOnTab(priorHandoffTabId);
	}

	try {
		const session = toAutoLaunchHandoffSession(handoff.fields);
		await persistHandoffForTab(handoff.fields, handoff.dashboardOrigin, tabId);
		attachAutoLaunchStartWhenTabReady(tabId, session);
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Could not start directory launch on this tab.';
		return { ok: false, error: message };
	}

	await chrome.tabs.update(tabId, { active: true });
	const focused = await chrome.tabs.get(tabId);
	if (focused.windowId != null) {
		await chrome.windows.update(focused.windowId, { focused: true });
	}
	broadcastPopup({
		type: POPUP_UI_MESSAGE.STATE_CHANGED,
		state: await loadAutoLaunchState(),
	});
	return { ok: true };
}

async function openDirectoryPageFromSidePanel(
	providerSlugHint: string
): Promise<{ ok: true } | { ok: false; error: string }> {
	const slug = providerSlugHint.trim();
	if (!slug) {
		return { ok: false, error: 'Pick a directory channel first.' };
	}

	const provider = getDirectoryLaunchProvider(slug);
	const state = await loadAutoLaunchState();
	if (state?.session.providerSlug === slug) {
		const openUrl = resolveDirectoryLaunchStartUrl(slug, state.session.startUrl);
		if (!openUrl) {
			return { ok: false, error: 'No directory URL for this channel.' };
		}

		const session =
			openUrl !== state.session.startUrl ? { ...state.session, startUrl: openUrl } : state.session;

		let tabId = state.handoffTabId ?? null;
		if (tabId != null) {
			try {
				await chrome.tabs.get(tabId);
			} catch {
				tabId = null;
			}
		}
		if (tabId == null && state.session.startUrl) {
			tabId = await findTabIdForStartUrlWithRetry(state.session.startUrl, 8, 100);
		}

		if (tabId != null) {
			await chrome.tabs.update(tabId, { url: openUrl, active: true });
			await saveAutoLaunchState({ ...state, handoffTabId: tabId, session });
			attachAutoLaunchStartWhenTabReady(tabId, session);
			const tab = await chrome.tabs.get(tabId);
			if (tab.windowId != null) {
				await chrome.windows.update(tab.windowId, { focused: true });
			}
			return { ok: true };
		}

		const tab = await chrome.tabs.create({ url: openUrl, active: true });
		const newTabId = tab.id;
		if (newTabId != null) {
			await saveAutoLaunchState({ ...state, handoffTabId: newTabId, session });
			attachAutoLaunchStartWhenTabReady(newTabId, session);
			return { ok: true };
		}
		return { ok: false, error: 'Could not open a directory tab.' };
	}

	return startDirectoryChannelFromSidePanel(slug);
}

async function resolveHandoffTabId(): Promise<number | null> {
	const state = await loadAutoLaunchState();
	if (state?.handoffTabId != null) {
		try {
			await chrome.tabs.get(state.handoffTabId);
			return state.handoffTabId;
		} catch {
			/* tab closed */
		}
	}
	if (state?.session.startUrl) {
		const found = await findTabIdForStartUrlWithRetry(state.session.startUrl, 4, 80);
		if (found !== null) {
			await saveAutoLaunchState({ ...state, handoffTabId: found });
			return found;
		}
	}
	return activeTabId();
}

async function sendToHandoffTabContent(message: Record<string, unknown>): Promise<unknown> {
	const tabId = await resolveHandoffTabId();
	if (tabId === null) {
		throw new Error('No directory tab found. Open the directory site for this launch.');
	}
	return chrome.tabs.sendMessage(tabId, message);
}

async function resolveOpenQuokAuthForDirectoryGate(): Promise<{
	loggedIn: boolean;
	loginUrl: string;
}> {
	const state = await loadAutoLaunchState();
	const preferredOrigin = state?.dashboardOrigin?.trim();
	if (preferredOrigin) {
		if (await hasDashboardSessionCookie(preferredOrigin)) {
			return { loggedIn: true, loginUrl: dashboardSignInUrl(preferredOrigin) };
		}
		const token = await readAccessTokenCookie(preferredOrigin);
		if (token && 'accessToken' in token) {
			return { loggedIn: true, loginUrl: dashboardSignInUrl(preferredOrigin) };
		}
	}
	return isDashboardLoggedIn();
}

export async function handleAutoLaunchRuntimeMessage(
	message: Record<string, unknown>,
	sender?: chrome.runtime.MessageSender
): Promise<unknown> {
	const type = message.type;

	if (type === CHECK_DIRECTORY_GATE_MESSAGE) {
		const auth = await resolveOpenQuokAuthForDirectoryGate();
		return {
			ok: true,
			openquokLoggedIn: auth.loggedIn,
			openquokLoginUrl: auth.loginUrl,
		};
	}

	if (type === 'OPENQUOK_AUTO_LAUNCH_GET_STATE') {
		return { ok: true, state: await loadAutoLaunchState() };
	}

	if (type === 'OPENQUOK_AUTO_LAUNCH_CLEAR') {
		await clearAutoLaunchState();
		broadcastPopup({ type: POPUP_UI_MESSAGE.STATE_CHANGED, state: null });
		return { ok: true };
	}

	if (type === 'OPENQUOK_AUTO_LAUNCH_ATTACH_TAB') {
		const providerSlug =
			typeof message.providerSlug === 'string' ? message.providerSlug.trim() : '';
		const state = await loadAutoLaunchState();
		if (!state || !providerSlug || state.session.providerSlug !== providerSlug) {
			return { ok: false };
		}
		const fromMessage = (message as { senderTabId?: number }).senderTabId;
		const fromSender = sender?.tab?.id;
		const resolvedTabId =
			typeof fromMessage === 'number'
				? fromMessage
				: typeof fromSender === 'number'
					? fromSender
					: (await activeTabId()) ?? undefined;
		if (resolvedTabId === undefined) {
			return { ok: false };
		}
		const tab = await chrome.tabs.get(resolvedTabId);
		if (!tab.url || !tabUrlMatchesSession(tab.url, state.session)) {
			return { ok: false };
		}
		await saveAutoLaunchState({ ...state, handoffTabId: resolvedTabId });
		await sendStartToTab(resolvedTabId, state.session, state.dashboardOrigin);
		return { ok: true };
	}

	if (type === 'OPENQUOK_AUTO_LAUNCH_REFRESH_PROFILE') {
		return refreshStoredDirectoryLaunchProfile();
	}

	if (type === OPENQUOK_AUTO_LAUNCH_PROFILE_SOURCES) {
		const state = await loadAutoLaunchState();
		if (!state?.session) {
			return { ok: true, activeId: undefined, options: [] };
		}
		const listed = await fetchOrganizationProductProfiles();
		if (!listed.ok) {
			return { ok: false, error: listed.error };
		}
		const built = buildDirectoryProfileSourceOptions(
			listed.profiles,
			state.session.productProfileId
		);
		return { ok: true, activeId: built.activeId, options: built.options };
	}

	if (type === OPENQUOK_AUTO_LAUNCH_SWITCH_PROFILE_SOURCE) {
		const profileId =
			typeof message.productProfileId === 'string' ? message.productProfileId.trim() : '';
		if (!profileId) {
			return { ok: false, error: 'productProfileId is required.' };
		}
		return applyStoredDirectoryLaunchProfileRefresh(profileId);
	}

	if (type === OPENQUOK_AUTO_LAUNCH_PEEK_PROFILE_SNAPSHOT) {
		const profileId =
			typeof message.productProfileId === 'string' ? message.productProfileId.trim() : '';
		if (!profileId) {
			return { ok: false, error: 'productProfileId is required.' };
		}
		const state = await loadAutoLaunchState();
		if (!state?.session?.launchToken || !state.dashboardOrigin) {
			return { ok: false, error: 'No active directory launch session.' };
		}
		const refreshed = await postRefreshSubmissionIntent(
			state.dashboardOrigin,
			state.session.launchToken,
			profileId
		);
		if (!refreshed.ok) {
			return refreshed;
		}
		return { ok: true, profileSnapshot: refreshed.fields.profileSnapshot };
	}

	if (type === OPENQUOK_AUTO_LAUNCH_RESET_PANEL_POSITION) {
		const state = await loadAutoLaunchState();
		if (!state?.session) {
			return { ok: false, error: 'No active directory launch.' };
		}
		const focused = await focusStoredLaunchTab(state);
		if (!focused.ok) {
			return focused;
		}
		try {
			await sendToHandoffTabContent({
				type: OPENQUOK_AUTO_LAUNCH_RESET_PANEL_POSITION,
				session: state.session,
				dashboardOrigin: state.dashboardOrigin,
			});
			return { ok: true };
		} catch (error) {
			const hint =
				error instanceof Error ? error.message : 'Content script unavailable on this tab.';
			return {
				ok: false,
				error: `${hint} Open the directory tab for ${state.session.providerSlug}.`,
			};
		}
	}

	if (type === OPENQUOK_AUTO_LAUNCH_FOCUS_TAB) {
		const state = await loadAutoLaunchState();
		if (!state?.session) {
			return { ok: false, error: 'No active directory launch.' };
		}
		const providerSlugHint =
			typeof message.providerSlug === 'string' ? message.providerSlug.trim() : '';
		if (providerSlugHint && providerSlugHint !== state.session.providerSlug) {
			const provider = getDirectoryLaunchProvider(providerSlugHint);
			const label = provider?.name ?? providerSlugHint;
			return {
				ok: false,
				error: `Active launch is ${state.session.providerSlug}. Use Open directory page for ${label}, or pick the active channel.`,
			};
		}
		return focusStoredLaunchTab(state);
	}

	if (type === OPENQUOK_AUTO_LAUNCH_OPEN_DIRECTORY_PAGE) {
		const providerSlugHint =
			typeof message.providerSlug === 'string' ? message.providerSlug : '';
		const opened = await openDirectoryPageFromSidePanel(providerSlugHint);
		if (opened.ok) {
			broadcastPopup({ type: POPUP_UI_MESSAGE.STATE_CHANGED, state: await loadAutoLaunchState() });
		}
		return opened;
	}

	if (type === OPENQUOK_AUTO_LAUNCH_SHOW_PANEL) {
		const providerSlugHint =
			typeof message.providerSlug === 'string' ? message.providerSlug.trim() : '';
		const state = await loadAutoLaunchState();

		if (state?.session) {
			const sameChannel =
				!providerSlugHint || state.session.providerSlug === providerSlugHint;
			if (sameChannel) {
				return focusStoredLaunchTab(state);
			}
			return startDirectoryChannelFromSidePanel(providerSlugHint);
		}

		if (!providerSlugHint) {
			return {
				ok: false,
				error: 'No active directory launch. Start from OpenQuok (My Products → Fill with extension).',
			};
		}
		return startDirectoryChannelFromSidePanel(providerSlugHint);
	}

	if (type === AUTO_LAUNCH_MESSAGE_TYPE.PROGRESS) {
		const progress = message as AutoLaunchProgressPayload & { type: string };
		broadcastPopup({
			type: POPUP_UI_MESSAGE.PROGRESS,
			progress: {
				providerSlug: progress.providerSlug,
				stepId: progress.stepId,
				stepLabel: progress.stepLabel,
				stepIndex: progress.stepIndex,
				stepCount: progress.stepCount,
				filledCount: progress.filledCount,
				totalFields: progress.totalFields,
				fieldResults: progress.fieldResults,
				errors: progress.errors,
			},
		});
		return { ok: true };
	}

	if (type === 'OPENQUOK_AUTO_LAUNCH_COMPLETE') {
		const state = await loadAutoLaunchState();
		if (!state) {
			return { ok: false, error: 'No active directory launch session.' };
		}
		const listingUrl =
			typeof message.listingUrl === 'string' ? message.listingUrl : undefined;
		const result = await postCompleteSubmission({
			dashboardOrigin: state.dashboardOrigin,
			launchToken: state.session.launchToken,
			listingUrl,
			evidence:
				message.evidence && typeof message.evidence === 'object'
					? (message.evidence as Record<string, unknown>)
					: {},
		});
		if (!result.ok) {
			return result;
		}
		await clearAutoLaunchState();
		broadcastPopup({ type: POPUP_UI_MESSAGE.STATE_CHANGED, state: null });
		return result;
	}

	const state = await loadAutoLaunchState();
	if (!state) {
		return { ok: false, error: 'No active directory launch. Start from the OpenQuok dashboard.' };
	}

	if (
		type === AUTO_LAUNCH_MESSAGE_TYPE.START ||
		type === AUTO_LAUNCH_MESSAGE_TYPE.FILL_ALL ||
		type === AUTO_LAUNCH_MESSAGE_TYPE.FILL_STEP ||
		type === AUTO_LAUNCH_MESSAGE_TYPE.FILL_FOCUSED
	) {
		try {
			const response = await sendToHandoffTabContent({
				...message,
				session: state.session,
				dashboardOrigin: state.dashboardOrigin,
			});
			return response ?? { ok: true };
		} catch (error) {
			const hint =
				error instanceof Error ? error.message : 'Content script unavailable on this tab.';
			return {
				ok: false,
				error: `${hint} Open the directory submission page for ${state.session.providerSlug}.`,
			};
		}
	}

	return { ok: false, error: 'Unsupported auto-launch message.' };
}
