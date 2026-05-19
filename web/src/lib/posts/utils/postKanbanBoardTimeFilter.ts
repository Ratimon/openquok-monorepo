import type { PostKanbanTimeFilter } from '$lib/posts/postKanbanBoard.types';
import dayjs from 'dayjs';

function parsePublishMs(publishDateIso: string): number {
	const ms = Date.parse(publishDateIso);
	return Number.isFinite(ms) ? ms : Number.NaN;
}

/** Posts without a valid publish time behave like upcoming (calendar list view). */
function isUpcomingPublishDate(publishDateIso: string, nowMs = Date.now()): boolean {
	const ms = parsePublishMs(publishDateIso);
	if (!Number.isFinite(ms)) return true;
	return ms >= nowMs;
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
	return true;
}
