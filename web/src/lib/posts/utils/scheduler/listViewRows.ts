import type { CalendarEventExternal } from '@schedule-x/calendar';

import type { SchedulerCalendarEvent } from '$lib/posts/scheduler.types';
import { DEFAULT_TAG_CHIP_COLOR } from '$lib/posts/utils/tagChipTheme';
import { stripHtmlToPlainText } from '$lib/utils/plainTextFromHtml';

export const LIST_VIEW_PAGE_SIZE = 100;

export const LIST_VIEW_NO_DATE_KEY = '__no_date__';

export type ListViewRow = {
	postGroup: string;
	postId?: string;
	integrationId?: string;
	content: string;
	channelPicture?: string;
	channelName?: string;
	channelIdentifier?: string;
	publishDateIso?: string;
	state?: string;
	chipTagColor: string;
};

export type ListViewDateGroup = {
	dateKey: string;
	label: string;
	rows: ListViewRow[];
};

export type ListViewPagination = {
	rows: ListViewRow[];
	totalCount: number;
	pageIndex: number;
	pageCount: number;
	rangeStart: number;
	rangeEnd: number;
};

type SlotSummaryItem = {
	postId?: string;
	postGroup?: string;
	integrationId?: string;
	content?: string;
	channelPicture?: string;
	channelName?: string;
	publishDate?: string;
	state?: string;
	channelIdentifier?: string;
};

export function parsePublishMs(iso: string | undefined): number {
	if (!iso) return Number.NaN;
	const ms = Date.parse(iso);
	return Number.isFinite(ms) ? ms : Number.NaN;
}

export function formatLocalDateTime(iso: string | undefined): { date: string; time: string } {
	const ms = parsePublishMs(iso);
	if (!Number.isFinite(ms)) return { date: '', time: '' };
	const d = new Date(ms);
	return {
		date: d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
		time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
	};
}

export function localDateKeyFromIso(iso: string | undefined): string | null {
	const ms = parsePublishMs(iso);
	if (!Number.isFinite(ms)) return null;
	const d = new Date(ms);
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function formatDateSectionHeader(dateKey: string): string {
	if (dateKey === LIST_VIEW_NO_DATE_KEY) return 'No date';
	const [y, m, d] = dateKey.split('-').map((part) => Number(part));
	if (!y || !m || !d) return dateKey;
	const parsed = new Date(y, m - 1, d);
	if (Number.isNaN(parsed.getTime())) return dateKey;
	return parsed.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

export function normalizeRowsFromEvents(evs: CalendarEventExternal[]): ListViewRow[] {
	const rows: ListViewRow[] = [];

	for (const ev of evs ?? []) {
		const schedEv = ev as SchedulerCalendarEvent;
		const chipTagColor = String(schedEv.chipTagColor ?? '').trim() || DEFAULT_TAG_CHIP_COLOR;
		const summary = (schedEv.slotSummary ?? null) as SlotSummaryItem[] | null;
		const posts = (
			Array.isArray(summary) && summary.length
				? summary
				: [(schedEv.post ?? {}) as SlotSummaryItem]
		).filter(Boolean);

		for (const s of posts) {
			const postGroup = String(s.postGroup ?? schedEv.post?.postGroup ?? '').trim();
			if (!postGroup) continue;
			rows.push({
				postGroup,
				postId: s.postId ? String(s.postId) : undefined,
				integrationId: s.integrationId ? String(s.integrationId) : undefined,
				content: stripHtmlToPlainText(String(s.content ?? '')).trim(),
				channelPicture: s.channelPicture ? String(s.channelPicture) : undefined,
				channelName: s.channelName
					? String(s.channelName)
					: schedEv.title
						? String(schedEv.title)
						: undefined,
				channelIdentifier: s.channelIdentifier ? String(s.channelIdentifier) : undefined,
				publishDateIso: typeof s.publishDate === 'string' ? s.publishDate : undefined,
				state: s.state ? String(s.state) : undefined,
				chipTagColor
			});
		}
	}

	const byKey = new Map<string, ListViewRow>();
	for (const r of rows) {
		const k = r.postId?.trim()
			? `id:${r.postId.trim()}`
			: `g:${r.postGroup}|i:${r.integrationId?.trim() ?? ''}|c:${r.channelIdentifier ?? ''}`;
		if (!byKey.has(k)) byKey.set(k, r);
	}
	return Array.from(byKey.values());
}

export function sortListRows(rows: readonly ListViewRow[]): ListViewRow[] {
	return [...rows].sort((a, b) => {
		const am = parsePublishMs(a.publishDateIso);
		const bm = parsePublishMs(b.publishDateIso);
		if (Number.isFinite(am) && Number.isFinite(bm)) return am - bm;
		if (Number.isFinite(am)) return -1;
		if (Number.isFinite(bm)) return 1;
		return a.postGroup.localeCompare(b.postGroup);
	});
}

export function groupRowsByDate(rows: readonly ListViewRow[]): ListViewDateGroup[] {
	const groups = new Map<string, ListViewRow[]>();

	for (const row of rows) {
		const dateKey = localDateKeyFromIso(row.publishDateIso) ?? LIST_VIEW_NO_DATE_KEY;
		const bucket = groups.get(dateKey);
		if (bucket) bucket.push(row);
		else groups.set(dateKey, [row]);
	}

	return [...groups.entries()]
		.sort(([a], [b]) => {
			if (a === LIST_VIEW_NO_DATE_KEY) return 1;
			if (b === LIST_VIEW_NO_DATE_KEY) return -1;
			return a.localeCompare(b);
		})
		.map(([dateKey, groupRows]) => ({
			dateKey,
			label: formatDateSectionHeader(dateKey),
			rows: groupRows
		}));
}

export function paginateRows(
	rows: readonly ListViewRow[],
	pageIndex: number,
	pageSize = LIST_VIEW_PAGE_SIZE
): ListViewPagination {
	const totalCount = rows.length;
	const safePageSize = Math.max(1, pageSize);
	const pageCount = Math.max(1, Math.ceil(totalCount / safePageSize));
	const safePageIndex = Math.min(Math.max(0, pageIndex), pageCount - 1);
	const rangeStart = totalCount === 0 ? 0 : safePageIndex * safePageSize + 1;
	const rangeEnd = totalCount === 0 ? 0 : Math.min(totalCount, (safePageIndex + 1) * safePageSize);
	const sliceStart = safePageIndex * safePageSize;

	return {
		rows: rows.slice(sliceStart, sliceStart + safePageSize),
		totalCount,
		pageIndex: safePageIndex,
		pageCount,
		rangeStart,
		rangeEnd
	};
}

export function resolveListViewEmptyMessage(
	filteredCount: number,
	windowRowCount?: number
): string | null {
	if (filteredCount > 0) return null;
	if (windowRowCount !== undefined && windowRowCount > 0) {
		return 'No posts match your filters';
	}
	return 'No posts in this date range';
}
