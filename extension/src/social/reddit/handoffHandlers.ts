import {
	REDDIT_HANDOFF_CONTENT_MESSAGE,
	REDDIT_HANDOFF_HASH_PREFIX,
	REDDIT_HANDOFF_RUNTIME_MESSAGE,
	type RedditHandoffFillPayload,
} from './handoffProtocol.js';
import { buildRedditSubmitPageUrl } from './submitUrls.js';
import { isRedditSubmitTabUrl, REDDIT_TAB_QUERY_URL_PATTERNS } from './redditTabUrls.js';
import type { RedditAutofillResult } from './submitAutofillPageContext.js';

const REDDIT_SUBMIT_SCRIPT = 'content/social-reddit/openquok-reddit-submit.js';
const REDDIT_AUTOFILL_MAIN_SCRIPT = 'content/social-reddit/openquok-reddit-autofill-main.js';

async function injectRedditSubmitScript(tabId: number): Promise<void> {
	try {
		await chrome.scripting.executeScript({
			target: { tabId },
			files: [REDDIT_SUBMIT_SCRIPT],
		});
	} catch {
		/* manifest content script may already be present */
	}
}

async function ensureMainWorldAutofillHook(tabId: number): Promise<void> {
	try {
		await chrome.scripting.executeScript({
			target: { tabId },
			world: 'MAIN',
			files: [REDDIT_AUTOFILL_MAIN_SCRIPT],
		});
	} catch {
		/* hook may already be registered */
	}
}

async function autofillViaMainWorld(
	tabId: number,
	payload: RedditHandoffFillPayload
): Promise<RedditAutofillResult | null> {
	await ensureMainWorldAutofillHook(tabId);
	try {
		const [injection] = await chrome.scripting.executeScript({
			target: { tabId },
			world: 'MAIN',
			func: (handoff: RedditHandoffFillPayload) => {
				const runner = (
					window as Window & {
						__openquokExecuteRedditAutofill?: (
							value: RedditHandoffFillPayload
						) => Promise<{ ok: boolean; error?: string; filled?: string[] }>;
					}
				).__openquokExecuteRedditAutofill;
				if (!runner) {
					return Promise.resolve({
						ok: false,
						error: 'OpenQuok could not load Reddit autofill in the page.',
					});
				}
				return runner(handoff);
			},
			args: [payload],
		});
		const result = injection?.result as RedditAutofillResult | undefined;
		return result ?? null;
	} catch (error) {
		return {
			ok: false,
			error:
				error instanceof Error
					? error.message
					: 'Could not inject OpenQuok autofill into this Reddit tab.',
		};
	}
}

async function sendAutofillToTab(
	tabId: number,
	payload: RedditHandoffFillPayload
): Promise<unknown> {
	return chrome.tabs.sendMessage(tabId, {
		type: REDDIT_HANDOFF_CONTENT_MESSAGE.AUTOFILL,
		payload,
	});
}

function waitForTabComplete(tabId: number, timeoutMs = 25_000): Promise<boolean> {
	return new Promise((resolve) => {
		let settled = false;
		const finish = (value: boolean) => {
			if (settled) return;
			settled = true;
			chrome.tabs.onUpdated.removeListener(listener);
			resolve(value);
		};

		const listener = (updatedTabId: number, info: chrome.tabs.TabChangeInfo) => {
			if (updatedTabId === tabId && info.status === 'complete') {
				finish(true);
			}
		};
		chrome.tabs.onUpdated.addListener(listener);

		void chrome.tabs
			.get(tabId)
			.then((tab) => {
				if (tab.status === 'complete') finish(true);
			})
			.catch(() => finish(false));

		setTimeout(() => finish(false), timeoutMs);
	});
}

function isAutofillSuccess(response: unknown): response is { ok: true } {
	return Boolean(response && typeof response === 'object' && (response as { ok?: boolean }).ok === true);
}

function autofillError(response: unknown, fallback: string): string {
	if (response && typeof response === 'object' && (response as { ok?: boolean }).ok === false) {
		const error = (response as { error?: string }).error;
		if (typeof error === 'string' && error.trim()) return error;
	}
	return fallback;
}

async function sendAutofillWithRetry(
	tabId: number,
	payload: RedditHandoffFillPayload,
	attempts = 15
): Promise<{ ok: true } | { ok: false; error: string }> {
	let lastError = 'Autofill failed on the Reddit tab.';
	let injectedIsolated = false;

	for (let attempt = 0; attempt < attempts; attempt++) {
		const mainResult = await autofillViaMainWorld(tabId, payload);
		if (mainResult && isAutofillSuccess(mainResult)) {
			return { ok: true };
		}
		if (mainResult) {
			lastError = autofillError(mainResult, lastError);
		}

		try {
			const response = await sendAutofillToTab(tabId, payload);
			if (isAutofillSuccess(response)) {
				return { ok: true };
			}
			lastError = autofillError(response, lastError);
		} catch (error) {
			lastError =
				error instanceof Error ? error.message : 'Could not reach the Reddit content script.';
			if (!injectedIsolated) {
				await injectRedditSubmitScript(tabId);
				injectedIsolated = true;
				await new Promise((resolve) => setTimeout(resolve, 300));
				continue;
			}
		}

		await new Promise((resolve) => setTimeout(resolve, 600));
	}

	return { ok: false, error: lastError };
}

export const REDDIT_HANDOFF_RUNTIME_TYPES = new Set<string>([
	REDDIT_HANDOFF_RUNTIME_MESSAGE.OPEN_SUBMIT_TAB,
	REDDIT_HANDOFF_RUNTIME_MESSAGE.AUTOFILL_SUBMIT,
]);

function handoffHash(postId: string): string {
	return `#${REDDIT_HANDOFF_HASH_PREFIX}${encodeURIComponent(postId)}`;
}

function handoffSubmitUrl(payload: RedditHandoffFillPayload): string {
	return `${buildRedditSubmitPageUrl(payload)}${handoffHash(payload.postId)}`;
}

async function findRedditSubmitTab(): Promise<number | null> {
	for (const pattern of REDDIT_TAB_QUERY_URL_PATTERNS) {
		const tabs = await chrome.tabs.query({ url: [pattern] });
		for (const tab of tabs) {
			if (!tab.id || !tab.url) continue;
			if (isRedditSubmitTabUrl(tab.url)) return tab.id;
		}
	}

	const tabs = await chrome.tabs.query({});
	for (const tab of tabs) {
		if (!tab.id || !tab.url) continue;
		if (isRedditSubmitTabUrl(tab.url)) return tab.id;
	}
	return null;
}

async function resolveAutofillTabId(submitUrl: string): Promise<number | null> {
	const existing = await findRedditSubmitTab();
	if (existing != null) {
		await chrome.tabs.update(existing, { url: submitUrl, active: true });
		return existing;
	}
	const opened = await openSubmitTab(submitUrl);
	if (!opened.ok) return null;
	return opened.tabId;
}

async function waitForRedditSubmitReady(tabId: number): Promise<void> {
	await waitForTabComplete(tabId);
	await new Promise((resolve) => setTimeout(resolve, 2_000));
}

async function openSubmitTab(
	url: string
): Promise<{ ok: true; tabId: number } | { ok: false; error: string }> {
	const tab = await chrome.tabs.create({ url, active: true });
	if (!tab.id) {
		return { ok: false, error: 'Could not open Reddit submit page.' };
	}
	return { ok: true, tabId: tab.id };
}

export async function openRedditSubmitTab(
	payload: RedditHandoffFillPayload,
	preferredSubmitUrl?: string
): Promise<{ ok: true } | { ok: false; error: string }> {
	const url =
		typeof preferredSubmitUrl === 'string' && preferredSubmitUrl.trim()
			? preferredSubmitUrl.trim()
			: handoffSubmitUrl(payload);
	const opened = await openSubmitTab(url);
	if (!opened.ok) return opened;
	await waitForRedditSubmitReady(opened.tabId);
	const autofill = await sendAutofillWithRetry(opened.tabId, payload);
	if (!autofill.ok) {
		return {
			ok: false,
			error: `${autofill.error} The submit page is open — try Autofill again after it finishes loading.`,
		};
	}
	return { ok: true };
}

export async function autofillRedditHandoffOnOpenTab(
	payload: RedditHandoffFillPayload
): Promise<{ ok: true } | { ok: false; error: string }> {
	const submitUrl = handoffSubmitUrl(payload);
	const tabId = await resolveAutofillTabId(submitUrl);
	if (tabId == null) {
		return { ok: false, error: 'Could not open Reddit submit page.' };
	}

	await waitForRedditSubmitReady(tabId);
	const result = await sendAutofillWithRetry(tabId, payload, 20);
	if (result.ok) {
		await chrome.tabs.update(tabId, { active: true });
		return { ok: true };
	}
	return result;
}

export function handleRedditHandoffRuntimeMessage(
	record: Record<string, unknown>
): Promise<unknown> | undefined {
	const type = record.type;
	if (typeof type !== 'string' || !REDDIT_HANDOFF_RUNTIME_TYPES.has(type)) {
		return undefined;
	}

	const payload = record.payload;
	if (!payload || typeof payload !== 'object') {
		return Promise.resolve({ ok: false, error: 'Missing handoff payload.' });
	}
	const handoff = payload as RedditHandoffFillPayload;

	if (type === REDDIT_HANDOFF_RUNTIME_MESSAGE.OPEN_SUBMIT_TAB) {
		const preferredUrl = typeof record.url === 'string' ? record.url : undefined;
		return openRedditSubmitTab(handoff, preferredUrl);
	}

	if (type === REDDIT_HANDOFF_RUNTIME_MESSAGE.AUTOFILL_SUBMIT) {
		return autofillRedditHandoffOnOpenTab(handoff);
	}

	return Promise.resolve({ ok: false, error: 'Unknown Reddit handoff action.' });
}
