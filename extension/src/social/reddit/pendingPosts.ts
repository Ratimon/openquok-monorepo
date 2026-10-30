import { formatRedditCommunityInput } from 'openquok-common';
import {
	completeMemberBrowserHandoff,
	fetchMemberBrowserHandoff,
	type RedditAwaitingPostRow,
	type SocialCalendarPostRow,
} from '../memberBrowserHandoffApi.js';
import type { SocialSessionContext } from '../openquokSocialApi.js';
import { stripHtmlToPlainText } from '../../shared/stripHtmlToPlainText.js';
import {
	autofillRedditHandoffOnOpenTab,
	openRedditSubmitTab,
} from './handoffHandlers.js';
import {
	REDDIT_HANDOFF_HASH_PREFIX,
	type RedditHandoffFillPayload,
} from './handoffProtocol.js';
import { savePendingRedditHandoff } from './pendingHandoffStorage.js';
import { buildRedditSubmitPageUrl } from './submitUrls.js';

export type RedditPendingActionResult =
	| { ok: true; message?: string }
	| { ok: false; error: string };

export function buildRedditClipboardText(parts: {
	community?: string | null;
	title?: string | null;
	body: string;
}): string {
	const lines: string[] = [];
	const community = parts.community?.trim()
		? formatRedditCommunityInput(parts.community)
		: '';
	if (community) lines.push(community);
	const title = parts.title?.trim() ?? '';
	const body = parts.body.trim();
	if (title) lines.push(title);
	if (body) lines.push(body);
	return lines.join('\n\n');
}

export function redditClipboardTextFromRow(
	row: SocialCalendarPostRow | RedditAwaitingPostRow
): string {
	const enriched = row as RedditAwaitingPostRow;
	const community =
		typeof enriched.handoffSubreddit === 'string' ? enriched.handoffSubreddit : null;
	const settingsTitle =
		typeof enriched.handoffTitle === 'string' ? enriched.handoffTitle : null;
	const body =
		(typeof enriched.handoffBody === 'string' && enriched.handoffBody.trim()
			? enriched.handoffBody
			: stripHtmlToPlainText(row.content)) ?? '';
	return buildRedditClipboardText({
		community,
		title: settingsTitle ?? row.title,
		body,
	});
}

export function redditHandoffSupportsOpenAutofill(_payload: RedditHandoffFillPayload): boolean {
	return true;
}

export async function copyTextToClipboard(text: string): Promise<RedditPendingActionResult> {
	const trimmed = text.trim();
	if (!trimmed) {
		return { ok: false, error: 'Nothing to copy yet.' };
	}
	try {
		await navigator.clipboard.writeText(trimmed);
		return { ok: true, message: 'Copied to clipboard.' };
	} catch {
		return { ok: false, error: 'Could not copy. Check clipboard permission for the extension.' };
	}
}

export async function copyRedditRowToClipboard(
	row: SocialCalendarPostRow
): Promise<RedditPendingActionResult> {
	return copyTextToClipboard(redditClipboardTextFromRow(row));
}

export async function copyRedditHandoffToClipboard(
	session: SocialSessionContext,
	postId: string
): Promise<RedditPendingActionResult> {
	const handoff = await fetchMemberBrowserHandoff(session, postId);
	if (!handoff.ok) return handoff;
	return copyTextToClipboard(
		buildRedditClipboardText({
			community: handoff.data.subreddit,
			title: handoff.data.title,
			body: handoff.data.body,
		})
	);
}

function handoffSubmitUrl(postId: string, payload: RedditHandoffFillPayload): string {
	return `${buildRedditSubmitPageUrl(payload)}#${REDDIT_HANDOFF_HASH_PREFIX}${encodeURIComponent(postId)}`;
}

export async function openRedditSubmitForPost(
	session: SocialSessionContext,
	postId: string
): Promise<RedditPendingActionResult> {
	const handoff = await fetchMemberBrowserHandoff(session, postId);
	if (!handoff.ok) return handoff;
	await savePendingRedditHandoff(handoff.data);
	const url = handoffSubmitUrl(postId, handoff.data);
	const opened = await openRedditSubmitTab(handoff.data, url);
	if (!opened.ok) return { ok: false, error: opened.error };
	return {
		ok: true,
		message: 'Opened Reddit submit. Review the draft and click Post yourself.',
	};
}

export async function autofillRedditPostInBrowser(
	session: SocialSessionContext,
	postId: string
): Promise<RedditPendingActionResult> {
	const handoff = await fetchMemberBrowserHandoff(session, postId);
	if (!handoff.ok) return handoff;
	await savePendingRedditHandoff(handoff.data);
	const filled = await autofillRedditHandoffOnOpenTab(handoff.data);
	if (!filled.ok) return { ok: false, error: filled.error };
	return {
		ok: true,
		message:
			'Autofill ran on Reddit — check the submit tab for your title and body (community picker opens at reddit.com/submit when Settings have no subreddit).',
	};
}

export async function markRedditPostComplete(
	session: SocialSessionContext,
	postId: string,
	releaseUrl?: string
): Promise<RedditPendingActionResult> {
	const result = await completeMemberBrowserHandoff(session, postId, releaseUrl);
	if (!result.ok) return result;
	return { ok: true, message: 'Marked as posted in OpenQuok.' };
}
