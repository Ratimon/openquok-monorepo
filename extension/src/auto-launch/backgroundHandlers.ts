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

function attachAutoLaunchStartWhenTabReady(tabId: number, session: AutoLaunchHandoffSession): void {
	const onUpdated = (updatedTabId: number, info: chrome.tabs.TabChangeInfo) => {
		if (updatedTabId !== tabId || info.status !== 'complete') return;
		chrome.tabs.onUpdated.removeListener(onUpdated);
		void chrome.tabs
			.sendMessage(tabId, {
				type: AUTO_LAUNCH_MESSAGE_TYPE.START,
				session,
			})
			.catch(() => {
				/* content script may load on next navigation */
			});
	};
	chrome.tabs.onUpdated.addListener(onUpdated);
	void chrome.tabs.get(tabId).then((tab) => {
		if (tab.status === 'complete') {
			chrome.tabs.onUpdated.removeListener(onUpdated);
			void chrome.tabs
				.sendMessage(tabId, {
					type: AUTO_LAUNCH_MESSAGE_TYPE.START,
					session,
				})
				.catch(() => {
					/* content script may load on next navigation */
				});
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

async function sendToActiveTabContent(message: Record<string, unknown>): Promise<unknown> {
	const tabId = await activeTabId();
	if (tabId === null) {
		throw new Error('No active tab.');
	}
	return chrome.tabs.sendMessage(tabId, message);
}

export async function handleAutoLaunchRuntimeMessage(
	message: Record<string, unknown>
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
			const response = await sendToActiveTabContent({
				...message,
				session: state.session,
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
