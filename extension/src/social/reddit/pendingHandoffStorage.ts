import {
	REDDIT_PENDING_HANDOFF_STORAGE_KEY,
	type RedditHandoffFillPayload,
} from './handoffProtocol.js';

export type StoredRedditPendingHandoff = RedditHandoffFillPayload & {
	storedAt: number;
};

export async function savePendingRedditHandoff(payload: RedditHandoffFillPayload): Promise<void> {
	const record: StoredRedditPendingHandoff = { ...payload, storedAt: Date.now() };
	await chrome.storage.session.set({
		[REDDIT_PENDING_HANDOFF_STORAGE_KEY]: record,
	});
}

export async function loadPendingRedditHandoff(
	postId: string
): Promise<RedditHandoffFillPayload | null> {
	const result = await chrome.storage.session.get(REDDIT_PENDING_HANDOFF_STORAGE_KEY);
	const raw = result[REDDIT_PENDING_HANDOFF_STORAGE_KEY];
	if (!raw || typeof raw !== 'object') return null;
	const record = raw as StoredRedditPendingHandoff;
	if (record.postId !== postId) return null;
	return {
		postId: record.postId,
		title: record.title,
		body: record.body,
		subreddit: record.subreddit,
	};
}

export async function clearPendingRedditHandoff(): Promise<void> {
	await chrome.storage.session.remove(REDDIT_PENDING_HANDOFF_STORAGE_KEY);
}
