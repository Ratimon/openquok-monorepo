import {
	AUTO_LAUNCH_MESSAGE_TYPE,
	toAutoLaunchHandoffSession,
	type AutoLaunchHandoffRequestFields,
	type AutoLaunchHandoffSession,
	type AutoLaunchProgressPayload,
} from 'openquok-common';

import { postCompleteSubmission } from './openquokApi.js';
import { POPUP_UI_MESSAGE, type PopupUiMessage } from './popupMessages.js';
import {
	clearAutoLaunchState,
	loadAutoLaunchState,
	saveAutoLaunchState,
	type StoredAutoLaunchState,
} from './sessionStorage.js';

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

export async function handleAutoLaunchRuntimeMessage(
	message: Record<string, unknown>,
	sender?: chrome.runtime.MessageSender
): Promise<unknown> {
	const type = message.type;

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

	if (type === 'OPENQUOK_AUTO_LAUNCH_FOCUS_TAB') {
		const state = await loadAutoLaunchState();
		const tabId = state?.handoffTabId;
		if (tabId == null) {
			return { ok: false, error: 'No directory tab tracked for this launch.' };
		}
		await chrome.tabs.update(tabId, { active: true });
		const tab = await chrome.tabs.get(tabId);
		if (tab.windowId != null) {
			await chrome.windows.update(tab.windowId, { focused: true });
		}
		return { ok: true };
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
		type === AUTO_LAUNCH_MESSAGE_TYPE.FILL_STEP
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
