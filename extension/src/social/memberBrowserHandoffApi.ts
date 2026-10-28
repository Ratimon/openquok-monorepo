import type { SocialSessionContext } from './openquokSocialApi.js';
import type { RedditHandoffFillPayload } from './reddit/handoffProtocol.js';

export type SocialCalendarPostRow = {
	id: string;
	state: string;
	publishDate: string;
	content: string;
	title: string | null;
	integrationId: string | null;
	providerIdentifier: string | null;
	channelName: string | null;
};

/** Calendar row plus member-browser handoff fields for Reddit side-panel UI. */
export type RedditAwaitingPostRow = SocialCalendarPostRow & {
	handoffSubreddit: string;
	handoffTitle: string;
	handoffBody: string;
	handoffMediaItems: RedditHandoffMediaItem[];
	handoffError?: string;
};

export type RedditHandoffMediaItem = {
	id: string;
	fileName: string;
};

export type MemberBrowserHandoffApiResult<T> =
	| { ok: true; data: T }
	| { ok: false; error: string };

function apiRoot(origin: string): string {
	return `${origin.replace(/\/+$/, '')}/api/v1`;
}

function parseRecord(body: unknown): Record<string, unknown> {
	return body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
}

function nestedData(record: Record<string, unknown>): Record<string, unknown> {
	const data = record.data;
	return data && typeof data === 'object' ? (data as Record<string, unknown>) : record;
}

function apiErrorMessage(body: unknown, fallback: string): string {
	const record = parseRecord(body);
	const message =
		(typeof record.message === 'string' && record.message) ||
		(typeof record.error === 'string' && record.error);
	return message || fallback;
}

function parseHandoffMediaItems(handoff: Record<string, unknown>): RedditHandoffMediaItem[] {
	const raw = handoff.mediaItems;
	if (!Array.isArray(raw)) return [];
	const items: RedditHandoffMediaItem[] = [];
	for (const entry of raw) {
		if (!entry || typeof entry !== 'object') continue;
		const row = entry as Record<string, unknown>;
		const id = typeof row.id === 'string' ? row.id : '';
		const fileName = typeof row.fileName === 'string' ? row.fileName.trim() : '';
		if (!id || !fileName) continue;
		items.push({ id, fileName });
	}
	return items;
}

function mapCalendarPost(row: Record<string, unknown>): SocialCalendarPostRow | null {
	const id = typeof row.id === 'string' ? row.id : '';
	if (!id) return null;
	return {
		id,
		state: typeof row.state === 'string' ? row.state : '',
		publishDate: typeof row.publishDate === 'string' ? row.publishDate : '',
		content: typeof row.content === 'string' ? row.content : '',
		title: typeof row.title === 'string' ? row.title : null,
		integrationId: typeof row.integrationId === 'string' ? row.integrationId : null,
		providerIdentifier:
			typeof row.providerIdentifier === 'string' ? row.providerIdentifier : null,
		channelName: typeof row.channelName === 'string' ? row.channelName : null,
	};
}

function listPostsDateRange(): { start: string; end: string } {
	const start = new Date();
	start.setDate(start.getDate() - 90);
	const end = new Date();
	end.setDate(end.getDate() + 7);
	return { start: start.toISOString(), end: end.toISOString() };
}

export async function listAwaitingMemberRedditPosts(
	session: SocialSessionContext
): Promise<MemberBrowserHandoffApiResult<SocialCalendarPostRow[]>> {
	const { start, end } = listPostsDateRange();
	const url = new URL(`${apiRoot(session.apiOrigin)}/posts/list`);
	url.searchParams.set('organizationId', session.organizationId);
	url.searchParams.set('start', start);
	url.searchParams.set('end', end);

	const response = await fetch(url.toString(), {
		method: 'GET',
		headers: { Authorization: `Bearer ${session.accessToken}` },
	});
	let body: unknown = null;
	try {
		body = await response.json();
	} catch {
		body = null;
	}
	if (!response.ok) {
		return {
			ok: false,
			error: apiErrorMessage(body, `Could not load posts (${response.status}).`),
		};
	}

	const record = parseRecord(body);
	const data = nestedData(record);
	const posts = data.posts;
	if (!Array.isArray(posts)) {
		return { ok: false, error: 'Could not load posts.' };
	}

	const rows: SocialCalendarPostRow[] = [];
	for (const item of posts) {
		if (!item || typeof item !== 'object') continue;
		const mapped = mapCalendarPost(item as Record<string, unknown>);
		if (!mapped) continue;
		if (mapped.state !== 'AWAITING_MEMBER') continue;
		if ((mapped.providerIdentifier ?? '').toLowerCase() !== 'reddit') continue;
		rows.push(mapped);
	}

	rows.sort((a, b) => b.publishDate.localeCompare(a.publishDate));
	return { ok: true, data: rows };
}

export async function enrichRedditPostsWithHandoff(
	session: SocialSessionContext,
	rows: SocialCalendarPostRow[]
): Promise<RedditAwaitingPostRow[]> {
	const enriched = await Promise.all(
		rows.map(async (row): Promise<RedditAwaitingPostRow> => {
			const handoff = await fetchMemberBrowserHandoff(session, row.id);
			if (!handoff.ok) {
				return {
					...row,
					handoffSubreddit: '',
					handoffTitle: '',
					handoffBody: '',
					handoffMediaItems: [],
					handoffError: handoff.error,
				};
			}
			return {
				...row,
				handoffSubreddit: handoff.data.subreddit,
				handoffTitle: handoff.data.title,
				handoffBody: handoff.data.body,
				handoffMediaItems:
					handoff.data.mediaItems.length > 0
						? handoff.data.mediaItems
						: handoff.data.mediaUrls.map((_, index) => ({
								id: `media-${index}`,
								fileName: `media-${index + 1}`,
							})),
			};
		})
	);
	return enriched;
}

export async function fetchMemberBrowserHandoff(
	session: SocialSessionContext,
	postId: string
): Promise<MemberBrowserHandoffApiResult<RedditHandoffFillPayload>> {
	const url = new URL(`${apiRoot(session.apiOrigin)}/posts/${postId}/member-browser-handoff`);
	url.searchParams.set('organizationId', session.organizationId);

	const response = await fetch(url.toString(), {
		method: 'GET',
		headers: { Authorization: `Bearer ${session.accessToken}` },
	});
	let body: unknown = null;
	try {
		body = await response.json();
	} catch {
		body = null;
	}
	if (!response.ok) {
		return {
			ok: false,
			error: apiErrorMessage(body, `Could not load handoff (${response.status}).`),
		};
	}

	const record = parseRecord(body);
	const data = nestedData(record);
	const handoff = (data.handoff ?? data) as Record<string, unknown>;
	const subreddit = typeof handoff.subreddit === 'string' ? handoff.subreddit : '';
	const title = typeof handoff.title === 'string' ? handoff.title : '';
	const contentBody = typeof handoff.body === 'string' ? handoff.body : '';

	return {
		ok: true,
		data: {
			postId,
			subreddit,
			title,
			body: contentBody,
			mediaUrls: parseHandoffMediaUrls(handoff),
			mediaItems: parseHandoffMediaItems(handoff),
		},
	};
}

function parseHandoffMediaUrls(handoff: Record<string, unknown>): string[] {
	const raw = handoff.mediaUrls;
	if (!Array.isArray(raw)) return [];
	const urls: string[] = [];
	for (const entry of raw) {
		if (typeof entry !== 'string') continue;
		const trimmed = entry.trim();
		if (trimmed) urls.push(trimmed);
	}
	return urls;
}

function fileNameFromContentDisposition(header: string | null): string | null {
	if (!header) return null;
	const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(header);
	if (utf8?.[1]) {
		try {
			return decodeURIComponent(utf8[1].trim());
		} catch {
			return utf8[1].trim();
		}
	}
	const quoted = /filename="([^"]+)"/i.exec(header);
	if (quoted?.[1]) return quoted[1].trim();
	const plain = /filename=([^;]+)/i.exec(header);
	return plain?.[1]?.trim() ?? null;
}

function triggerBrowserFileDownload(blob: Blob, fileName: string): void {
	const objectUrl = URL.createObjectURL(blob);
	try {
		const anchor = document.createElement('a');
		anchor.href = objectUrl;
		anchor.download = fileName;
		anchor.rel = 'noopener';
		document.body.appendChild(anchor);
		anchor.click();
		anchor.remove();
	} finally {
		URL.revokeObjectURL(objectUrl);
	}
}

export type DownloadMemberBrowserHandoffMediaResult = { ok: true } | { ok: false; error: string };

/** Authenticated download from workspace storage (avoids broken public CDN URLs). */
export async function downloadMemberBrowserHandoffMedia(
	session: SocialSessionContext,
	postId: string,
	mediaIndex: number,
	fallbackFileName: string
): Promise<DownloadMemberBrowserHandoffMediaResult> {
	const url = new URL(
		`${apiRoot(session.apiOrigin)}/posts/${encodeURIComponent(postId)}/member-browser-handoff/media/${mediaIndex}`
	);
	url.searchParams.set('organizationId', session.organizationId);

	const response = await fetch(url.toString(), {
		method: 'GET',
		headers: { Authorization: `Bearer ${session.accessToken}` },
	});
	if (!response.ok) {
		return {
			ok: false,
			error: `Could not download media (${response.status}).`,
		};
	}

	let blob: Blob;
	try {
		blob = await response.blob();
	} catch {
		return { ok: false, error: 'Could not read downloaded media.' };
	}

	const fileName =
		fileNameFromContentDisposition(response.headers.get('Content-Disposition')) ||
		fallbackFileName.trim() ||
		'media';
	triggerBrowserFileDownload(blob, fileName);
	return { ok: true };
}

export async function completeMemberBrowserHandoff(
	session: SocialSessionContext,
	postId: string,
	releaseUrl?: string
): Promise<MemberBrowserHandoffApiResult<{ id: string }>> {
	const response = await fetch(
		`${apiRoot(session.apiOrigin)}/posts/${postId}/member-browser-complete`,
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${session.accessToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				organizationId: session.organizationId,
				...(releaseUrl?.trim() ? { releaseUrl: releaseUrl.trim() } : {}),
			}),
		}
	);
	let body: unknown = null;
	try {
		body = await response.json();
	} catch {
		body = null;
	}
	if (!response.ok) {
		return {
			ok: false,
			error: apiErrorMessage(body, `Could not mark complete (${response.status}).`),
		};
	}
	const record = parseRecord(body);
	const data = nestedData(record);
	const id = typeof data.id === 'string' ? data.id : postId;
	return { ok: true, data: { id } };
}
