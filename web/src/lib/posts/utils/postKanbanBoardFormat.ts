import type { PostKanbanColumnId } from '$lib/posts/postKanbanBoard.types';
import type { TiktokManualFinishViewModel } from '$lib/posts/utils/tiktokKanbanManualFinish';
import dayjs from 'dayjs';

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
