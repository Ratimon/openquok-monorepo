import {
	downloadMemberBrowserHandoffMedia,
	enrichRedditPostsWithHandoff,
	listAwaitingMemberRedditPosts,
	type RedditAwaitingPostRow,
	type RedditHandoffMediaItem,
} from '../../social/memberBrowserHandoffApi.js';
import {
	autofillRedditPostInBrowser,
	copyRedditHandoffToClipboard,
	copyRedditRowToClipboard,
	markRedditPostComplete,
	openRedditSubmitForPost,
} from '../../social/reddit/pendingPosts.js';
import type { SocialSessionContext } from '../../social/openquokSocialApi.js';
import { formatRedditCommunityInput } from 'openquok-common';
import { stripHtmlToPlainText } from '../../shared/stripHtmlToPlainText.js';
import { escapeHtml } from './uiHelpers.js';

export type RedditActionNeededController = {
	refresh: () => Promise<void>;
	destroy: () => void;
};

/** Poll while the side panel is visible so dashboard-scheduled posts appear without manual Refresh. */
const REDDIT_ACTION_POLL_MS = 30_000;

function formatPublishLabel(iso: string): string {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return 'Ready';
	return date.toLocaleString(undefined, {
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
	});
}

function postHeadline(row: RedditAwaitingPostRow): string {
	const settingsTitle = row.handoffTitle.trim();
	if (settingsTitle) return settingsTitle;
	const rowTitle = row.title?.trim();
	if (rowTitle) return rowTitle;
	const body =
		row.handoffBody.trim() ||
		stripHtmlToPlainText(row.content).replace(/\s+/g, ' ').trim();
	const snippet = body.slice(0, 80);
	return snippet || 'Reddit post';
}

function postTargetLine(row: RedditAwaitingPostRow): string | null {
	const community = row.handoffSubreddit.trim()
		? formatRedditCommunityInput(row.handoffSubreddit)
		: '';
	const settingsTitle = row.handoffTitle.trim();
	const parts: string[] = [];
	if (community) parts.push(community);
	else parts.push('reddit.com/submit');
	if (settingsTitle) parts.push(`Title: ${settingsTitle}`);
	return parts.join(' · ');
}

function postBodyPreview(row: RedditAwaitingPostRow): string | null {
	const body =
		row.handoffBody.trim() || stripHtmlToPlainText(row.content).trim();
	if (!body) return null;
	const headline = postHeadline(row);
	if (body === headline || body.replace(/\s+/g, ' ') === headline.replace(/\s+/g, ' ')) {
		return null;
	}
	return body.replace(/\s+/g, ' ').slice(0, 160);
}

function mediaDownloadButtonLabel(item: RedditHandoffMediaItem, index: number, total: number): string {
	if (total <= 1) return 'Download media';
	const base = item.fileName.trim() || `media ${index + 1}`;
	return `Download ${base}`;
}

export function mountRedditActionNeeded(
	host: HTMLElement,
	getSession: () => SocialSessionContext | null,
	onPostsChanged?: () => void
): RedditActionNeededController {
	let rows: RedditAwaitingPostRow[] = [];
	let loading = false;
	let error = '';
	let busyPostId: string | null = null;
	let actionMessage = '';

	function render(): void {
		const session = getSession();
		if (!session) {
			host.replaceChildren();
			host.hidden = true;
			return;
		}
		host.hidden = false;

		const listHtml =
			rows.length === 0 && !loading
				? '<p class="muted reddit-action-empty">No Reddit posts waiting for you in the browser.</p>'
				: rows
						.map((row) => {
							const busy = busyPostId === row.id;
							const channel = row.channelName?.trim() ? escapeHtml(row.channelName.trim()) : 'Reddit';
							const targetLine = postTargetLine(row);
							const bodyPreview = postBodyPreview(row);
							const noSubreddit = !row.handoffSubreddit.trim();
							const mediaItems = row.handoffMediaItems ?? [];
							const mediaButtons = mediaItems
								.map(
									(item, index) =>
										`<button type="button" class="secondary reddit-download-media" data-post-id="${escapeHtml(row.id)}" data-media-index="${index}" data-media-file-name="${escapeHtml(item.fileName)}" ${busy ? 'disabled' : ''}>${escapeHtml(mediaDownloadButtonLabel(item, index, mediaItems.length))}</button>`
								)
								.join('');
							return `
				<li class="reddit-action-item" data-post-id="${escapeHtml(row.id)}">
					<div class="reddit-action-item-head">
						<strong>${escapeHtml(postHeadline(row))}</strong>
						<span class="reddit-action-target muted">${escapeHtml(targetLine)}</span>
						${bodyPreview ? `<span class="reddit-action-body-preview muted">${escapeHtml(bodyPreview)}</span>` : ''}
						${noSubreddit ? '<span class="reddit-action-target muted">No subreddit in Settings — Open submit / Autofill use reddit.com/submit so you can pick the community on Reddit.</span>' : ''}
						${row.handoffError ? `<span class="error">${escapeHtml(row.handoffError)}</span>` : ''}
						<span class="reddit-action-meta">${escapeHtml(formatPublishLabel(row.publishDate))} · ${channel}</span>
					</div>
					<div class="reddit-action-buttons">
						<button type="button" class="secondary reddit-copy" data-post-id="${escapeHtml(row.id)}" ${busy ? 'disabled' : ''}>Copy</button>
						<button type="button" class="secondary reddit-open-submit" data-post-id="${escapeHtml(row.id)}" ${busy ? 'disabled' : ''}>Open submit</button>
						<button type="button" class="secondary reddit-autofill" data-post-id="${escapeHtml(row.id)}" ${busy ? 'disabled' : ''}>Autofill</button>
						${mediaButtons}
						<button type="button" class="primary reddit-complete" data-post-id="${escapeHtml(row.id)}" ${busy ? 'disabled' : ''}>Mark posted</button>
					</div>
				</li>`;
						})
						.join('');

		host.innerHTML = `
			<div class="reddit-action-needed card">
				<strong>Reddit — action needed</strong>
				<p class="muted">Due on reddit.com: copy caption, open submit (or autofill), download attached media if needed, post manually, then mark complete. Set subreddit in Reddit Settings for a direct community submit link; otherwise OpenQuok uses reddit.com/submit.</p>
				${loading ? '<p class="status">Loading…</p>' : ''}
				${error ? `<p class="error" role="alert">${escapeHtml(error)}</p>` : ''}
				${actionMessage ? `<p class="status success" role="status">${escapeHtml(actionMessage)}</p>` : ''}
				<ul class="reddit-action-list">${listHtml}</ul>
			</div>
		`;

		host.querySelectorAll<HTMLButtonElement>('.reddit-copy').forEach((btn) => {
			btn.addEventListener('click', () => {
				const postId = btn.dataset.postId;
				if (postId) void copyPost(postId);
			});
		});
		host.querySelectorAll<HTMLButtonElement>('.reddit-open-submit').forEach((btn) => {
			btn.addEventListener('click', () => {
				const postId = btn.dataset.postId;
				if (postId) void openSubmit(postId);
			});
		});
		host.querySelectorAll<HTMLButtonElement>('.reddit-autofill').forEach((btn) => {
			btn.addEventListener('click', () => {
				const postId = btn.dataset.postId;
				if (postId) void autofillOnly(postId);
			});
		});
		host.querySelectorAll<HTMLButtonElement>('.reddit-complete').forEach((btn) => {
			btn.addEventListener('click', () => {
				const postId = btn.dataset.postId;
				if (postId) void markComplete(postId);
			});
		});
		host.querySelectorAll<HTMLButtonElement>('.reddit-download-media').forEach((btn) => {
			btn.addEventListener('click', () => {
				const postId = btn.dataset.postId;
				const mediaIndexRaw = btn.dataset.mediaIndex;
				const fileName = btn.dataset.mediaFileName ?? 'media';
				if (postId && mediaIndexRaw != null) {
					const mediaIndex = Number(mediaIndexRaw);
					if (Number.isInteger(mediaIndex) && mediaIndex >= 0) {
						void downloadMedia(postId, mediaIndex, fileName);
					}
				}
			});
		});
	}

	async function runAction(
		postId: string,
		action: () => Promise<{ ok: boolean; error?: string; message?: string }>
	): Promise<void> {
		const session = getSession();
		if (!session) return;
		busyPostId = postId;
		actionMessage = '';
		error = '';
		render();
		const result = await action();
		busyPostId = null;
		if (!result.ok) {
			error = result.error ?? 'Action failed.';
		} else {
			actionMessage = result.message ?? 'Done.';
		}
		render();
	}

	async function copyPost(postId: string): Promise<void> {
		const session = getSession();
		if (!session) return;
		const row = rows.find((item) => item.id === postId);
		await runAction(postId, async () => {
			if (row) {
				const quick = await copyRedditRowToClipboard(row);
				if (quick.ok) return quick;
			}
			return copyRedditHandoffToClipboard(session, postId);
		});
	}

	async function openSubmit(postId: string): Promise<void> {
		const session = getSession();
		if (!session) return;
		await runAction(postId, () => openRedditSubmitForPost(session, postId));
	}

	async function autofillOnly(postId: string): Promise<void> {
		const session = getSession();
		if (!session) return;
		await runAction(postId, () => autofillRedditPostInBrowser(session, postId));
	}

	async function downloadMedia(
		postId: string,
		mediaIndex: number,
		fileName: string
	): Promise<void> {
		const session = getSession();
		if (!session) return;
		await runAction(postId, async () => {
			const result = await downloadMemberBrowserHandoffMedia(
				session,
				postId,
				mediaIndex,
				fileName
			);
			if (!result.ok) return result;
			return { ok: true, message: 'Media download started.' };
		});
	}

	async function markComplete(postId: string): Promise<void> {
		const session = getSession();
		if (!session) return;
		const releaseUrl = window.prompt(
			'Paste the Reddit post URL (optional). Leave blank if you do not have it yet.'
		);
		if (releaseUrl === null) return;
		await runAction(postId, async () => {
			const result = await markRedditPostComplete(session, postId, releaseUrl.trim() || undefined);
			if (result.ok) {
				await refresh();
				onPostsChanged?.();
			}
			return result;
		});
	}

	async function refresh(): Promise<void> {
		const session = getSession();
		if (!session) {
			rows = [];
			render();
			return;
		}
		loading = true;
		error = '';
		render();
		const result = await listAwaitingMemberRedditPosts(session);
		loading = false;
		if (!result.ok) {
			error = result.error;
			rows = [];
		} else {
			rows = await enrichRedditPostsWithHandoff(session, result.data);
		}
		render();
	}

	void refresh();

	const onVisibilityRefresh = (): void => {
		if (document.visibilityState === 'visible') {
			void refresh();
		}
	};
	document.addEventListener('visibilitychange', onVisibilityRefresh);

	const pollId = window.setInterval(() => {
		if (document.visibilityState !== 'visible') return;
		void refresh();
	}, REDDIT_ACTION_POLL_MS);

	return {
		refresh: () => refresh(),
		destroy: () => {
			document.removeEventListener('visibilitychange', onVisibilityRefresh);
			window.clearInterval(pollId);
			host.replaceChildren();
			host.hidden = true;
		},
	};
}
