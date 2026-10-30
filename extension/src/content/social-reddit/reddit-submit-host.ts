import {
	REDDIT_HANDOFF_CONTENT_MESSAGE,
	REDDIT_HANDOFF_HASH_PREFIX,
	type RedditHandoffFillPayload,
} from '../../social/reddit/handoffProtocol.js';
import { loadPendingRedditHandoff } from '../../social/reddit/pendingHandoffStorage.js';
import { runRedditHandoffAutofillInPage, type RedditAutofillResult } from '../../social/reddit/submitAutofillPageContext.js';
import { isRedditSubmitLocation } from '../../social/reddit/submitUrls.js';
import { isExtensionRuntimeAvailable } from '../../shared/extensionRuntime.js';

function readPostIdFromHash(): string | null {
	const hash = window.location.hash.replace(/^#/, '');
	if (!hash.startsWith(REDDIT_HANDOFF_HASH_PREFIX)) return null;
	const postId = decodeURIComponent(hash.slice(REDDIT_HANDOFF_HASH_PREFIX.length).trim());
	return postId || null;
}

const BOOTSTRAP_FLAG = '__openquokRedditSubmitBootstrapped';

async function runAutofill(payload: RedditHandoffFillPayload): Promise<RedditAutofillResult> {
	if (!isRedditSubmitLocation(window.location.href)) {
		return { ok: false, error: 'Open a Reddit submit page to autofill this draft.' };
	}
	return runRedditHandoffAutofillInPage(payload);
}

async function tryAutofillFromPendingHash(): Promise<void> {
	const postId = readPostIdFromHash();
	if (!postId) return;
	const payload = await loadPendingRedditHandoff(postId);
	if (!payload) return;
	await runAutofill(payload);
}

function registerMessageListener(): void {
	chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
		if (!message || typeof message !== 'object') return;
		const record = message as Record<string, unknown>;
		if (record.type !== REDDIT_HANDOFF_CONTENT_MESSAGE.AUTOFILL) return;

		const payload = record.payload;
		if (!payload || typeof payload !== 'object') {
			sendResponse({ ok: false, error: 'Missing handoff payload.' });
			return true;
		}
		const handoff = payload as RedditHandoffFillPayload;
		void runAutofill(handoff).then(sendResponse);
		return true;
	});
}

function bootstrap(): void {
	if (!isExtensionRuntimeAvailable()) return;
	if ((globalThis as Record<string, unknown>)[BOOTSTRAP_FLAG]) return;
	(globalThis as Record<string, unknown>)[BOOTSTRAP_FLAG] = true;
	registerMessageListener();
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => {
			void tryAutofillFromPendingHash();
		});
	} else {
		void tryAutofillFromPendingHash();
	}
}

bootstrap();
