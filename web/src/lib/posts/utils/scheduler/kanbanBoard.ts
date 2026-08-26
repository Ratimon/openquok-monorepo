import type { PostRowProgrammerModel } from '$lib/posts/Post.repository.svelte';
import type { PostKanbanColumnId, PostKanbanRowViewModel, PostKanbanTimeFilter } from '$lib/posts/postKanbanBoard.types';
import { readTiktokLaunchSettings } from '$lib/ui/components/posts/providers/tiktok/tiktok.provider';
import dayjs from 'dayjs';

// --- Post settings JSON ---

function parsePostSettingsJson(settings: string | null | undefined): Record<string, unknown> | null {
	if (!settings?.trim()) return null;
	try {
		const parsed: unknown = JSON.parse(settings);
		return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : null;
	} catch {
		return null;
	}
}

function providerSettingsFromPostSettings(
	settings: string | null | undefined
): Record<string, unknown> {
	const root = parsePostSettingsJson(settings);
	if (!root) return {};
	const ps = root.providerSettings;
	return ps && typeof ps === 'object' ? (ps as Record<string, unknown>) : {};
}

// --- Manual finish (TikTok + kanban ack) ---

export type TiktokManualFinishKind = 'inbox' | 'private_draft';

export type TiktokManualFinishViewModel = {
	kind: TiktokManualFinishKind;
	statusLabel: string;
	/** Shown on kanban when `posts.note` is empty; agents should prefer `--note` with the same text. */
	defaultReviewNote: string;
};

/** User dragged a manual-finish post to Published on the kanban (stored in `posts.settings`). */
export function isKanbanManualFinishAcknowledged(settings: string | null | undefined): boolean {
	const root = parsePostSettingsJson(settings);
	return root?.kanbanManualFinishAcknowledged === true;
}

export function withKanbanManualFinishAcknowledged(settings: string | null | undefined): string {
	const root = parsePostSettingsJson(settings) ?? {};
	return JSON.stringify({ ...root, kanbanManualFinishAcknowledged: true });
}

/**
 * TikTok rows that OpenQuok marked PUBLISHED but still need finishing in the TikTok app
 * (inbox upload or private draft for manual music/editing).
 */
export function resolveTiktokManualFinish(row: {
	state: string;
	providerIdentifier?: string | null;
	settings?: string | null;
}): TiktokManualFinishViewModel | null {
	if (row.state !== 'PUBLISHED') return null;
	if (row.providerIdentifier?.trim() !== 'tiktok') return null;

	const tiktok = readTiktokLaunchSettings(providerSettingsFromPostSettings(row.settings));
	if (tiktok.content_posting_method === 'UPLOAD') {
		return {
			kind: 'inbox',
			statusLabel: 'In TikTok inbox',
			defaultReviewNote:
				'Finish in TikTok app: open inbox, add trending audio, pick cover, then publish.'
		};
	}
	if (tiktok.privacy_level === 'SELF_ONLY') {
		return {
			kind: 'private_draft',
			statusLabel: 'Private on TikTok',
			defaultReviewNote:
				'Finish in TikTok app: add trending audio, set privacy to public, then publish.'
		};
	}
	return null;
}

// --- Row view models ---

/** Maps list/flip/review API rows to kanban list view models. */
export function toPostKanbanRowVm(pm: PostRowProgrammerModel): PostKanbanRowViewModel {
	return {
		id: pm.id,
		postGroup: pm.postGroup,
		state: pm.state,
		publishDate: pm.publishDate,
		organizationId: pm.organizationId,
		integrationId: pm.integrationId,
		content: pm.content,
		intervalInDays: pm.intervalInDays,
		repeatInterval: pm.repeatInterval,
		error: pm.error,
		channelName: pm.channelName,
		channelPictureUrl: pm.channelPictureUrl,
		providerIdentifier: pm.providerIdentifier,
		settings: pm.settings ?? null,
		note: pm.note ?? null,
		isAgentEdited: pm.isAgentEdited ?? false,
		isReviewed: pm.isReviewed ?? false,
		tagNames: Array.isArray(pm.tagNames) ? pm.tagNames : []
	};
}

export function toPostKanbanRowsVm(rowsPm: PostRowProgrammerModel[]): PostKanbanRowViewModel[] {
	return rowsPm.map(toPostKanbanRowVm);
}

// --- Column mapping & publish labels ---

function parsePublishMs(publishDateIso: string): number {
	const ms = Date.parse(publishDateIso);
	return Number.isFinite(ms) ? ms : Number.NaN;
}

export function stateToKanbanColumn(
	state: string,
	manualFinish?: TiktokManualFinishViewModel | null
): PostKanbanColumnId | null {
	if (state === 'DRAFT') return 'draft';
	if (state === 'QUEUE') return 'scheduled';
	if (state === 'PUBLISHED') {
		return manualFinish ? 'scheduled' : 'published';
	}
	return null;
}

export function kanbanColumnStatusLabel(
	column: PostKanbanColumnId,
	manualFinish?: TiktokManualFinishViewModel | null
): string {
	if (manualFinish) return manualFinish.statusLabel;
	if (column === 'draft') return 'Draft';
	if (column === 'scheduled') return 'Scheduled';
	return 'Published';
}

export function formatKanbanPublishScheduleLabel(publishDateIso: string): string {
	const ms = parsePublishMs(publishDateIso);
	if (!Number.isFinite(ms)) return '';
	return dayjs(ms).format('MMM D, h:mm A');
}

/** Relative countdown from now to publish time, e.g. `(in 5 hrs)` or `(3 hrs ago)`. */
export function formatKanbanRelativePublishLabel(
	publishDateIso: string,
	nowMs = Date.now()
): string {
	const ms = parsePublishMs(publishDateIso);
	if (!Number.isFinite(ms)) return '';

	const diffMs = ms - nowMs;
	const absDiffMs = Math.abs(diffMs);
	const isFuture = diffMs > 0;

	const minuteMs = 60_000;
	const hourMs = 60 * minuteMs;
	const dayMs = 24 * hourMs;

	if (absDiffMs < minuteMs) {
		return isFuture ? '(in <1 min)' : '(just now)';
	}

	if (absDiffMs < hourMs) {
		const mins = Math.round(absDiffMs / minuteMs);
		return isFuture
			? `(in ${mins} min${mins === 1 ? '' : 's'})`
			: `(${mins} min${mins === 1 ? '' : 's'} ago)`;
	}

	if (absDiffMs < dayMs) {
		const hrs = Math.round(absDiffMs / hourMs);
		return isFuture
			? `(in ${hrs} hr${hrs === 1 ? '' : 's'})`
			: `(${hrs} hr${hrs === 1 ? '' : 's'} ago)`;
	}

	const days = Math.round(absDiffMs / dayMs);
	return isFuture
		? `(in ${days} day${days === 1 ? '' : 's'})`
		: `(${days} day${days === 1 ? '' : 's'} ago)`;
}

// --- Time filter ---

/** Posts without a valid publish time behave like upcoming (calendar list view). */
function isUpcomingPublishDate(publishDateIso: string, nowMs = Date.now()): boolean {
	const ms = parsePublishMs(publishDateIso);
	if (!Number.isFinite(ms)) return true;
	return ms >= nowMs;
}

function isPastPublishDate(publishDateIso: string, nowMs = Date.now()): boolean {
	const ms = parsePublishMs(publishDateIso);
	if (!Number.isFinite(ms)) return false;
	return ms < nowMs;
}

export function matchesKanbanTimeFilter(
	publishDateIso: string,
	filter: PostKanbanTimeFilter,
	nowMs = Date.now()
): boolean {
	const ms = parsePublishMs(publishDateIso);
	const now = dayjs(nowMs);

	if (filter === 'all-upcoming') {
		return isUpcomingPublishDate(publishDateIso, nowMs);
	}
	if (filter === 'next-week') {
		if (!Number.isFinite(ms) || ms < nowMs) return false;
		return ms < now.add(7, 'day').endOf('day').valueOf();
	}
	if (filter === 'next-30-days') {
		if (!Number.isFinite(ms) || ms < nowMs) return false;
		return ms < now.add(30, 'day').endOf('day').valueOf();
	}
	if (filter === 'past') {
		return isPastPublishDate(publishDateIso, nowMs);
	}
	return true;
}
