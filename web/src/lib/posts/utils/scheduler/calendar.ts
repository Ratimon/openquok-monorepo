import 'temporal-polyfill/global';

import type { CalendarPostRowViewModel } from '$lib/posts/GetScheduledPost.presenter.svelte';
import { channelVmFromDisplay, resolvePostChannelDisplay } from '$lib/posts/GetScheduledPost.presenter.svelte';
import type {
	CalendarGranularityViewModel,
	ChannelViewModel,
	SchedulerCalendarEvent,
	SchedulerSlotSummaryEntry
} from '$lib/posts/scheduler.types';
import { stripHtmlToPlainText } from '$lib/utils/plainTextFromHtml';

// --- Calendar date ranges ---

function yyyyMmDd(d: Date): string {
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayUtcYyyyMmDd(): string {
	return yyyyMmDd(new Date());
}

export function startOfIsoWeek(dateStr: string): string {
	const d = new Date(`${dateStr}T00:00:00Z`);
	const day = d.getUTCDay() === 0 ? 7 : d.getUTCDay();
	d.setUTCDate(d.getUTCDate() - (day - 1));
	return yyyyMmDd(d);
}

export function endOfIsoWeek(dateStr: string): string {
	const d = new Date(`${startOfIsoWeek(dateStr)}T00:00:00Z`);
	d.setUTCDate(d.getUTCDate() + 6);
	return yyyyMmDd(d);
}

export function startOfMonth(dateStr: string): string {
	const d = new Date(`${dateStr}T00:00:00Z`);
	const first = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
	return yyyyMmDd(first);
}

export function endOfMonth(dateStr: string): string {
	const d = new Date(`${dateStr}T00:00:00Z`);
	const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
	return yyyyMmDd(last);
}

export function rangeForGranularity(
	granularity: CalendarGranularityViewModel,
	base = todayUtcYyyyMmDd()
): { rangeStartDate: string; rangeEndDate: string } {
	if (granularity === 'day') {
		return { rangeStartDate: base, rangeEndDate: base };
	}
	if (granularity === 'week') {
		return { rangeStartDate: startOfIsoWeek(base), rangeEndDate: endOfIsoWeek(base) };
	}
	return { rangeStartDate: startOfMonth(base), rangeEndDate: endOfMonth(base) };
}

export function shiftRange(
	granularity: CalendarGranularityViewModel,
	rangeStartDate: string,
	delta: number
): { rangeStartDate: string; rangeEndDate: string } {
	const start = new Date(`${rangeStartDate}T00:00:00Z`);
	if (granularity === 'day') {
		start.setUTCDate(start.getUTCDate() + delta);
		const d = yyyyMmDd(start);
		return { rangeStartDate: d, rangeEndDate: d };
	}
	if (granularity === 'week') {
		start.setUTCDate(start.getUTCDate() + delta * 7);
		const base = yyyyMmDd(start);
		return { rangeStartDate: startOfIsoWeek(base), rangeEndDate: endOfIsoWeek(base) };
	}
	start.setUTCMonth(start.getUTCMonth() + delta);
	const base = yyyyMmDd(start);
	return { rangeStartDate: startOfMonth(base), rangeEndDate: endOfMonth(base) };
}

export function labelForRange(
	granularity: CalendarGranularityViewModel,
	rangeStartDate: string,
	rangeEndDate: string
): string {
	if (!rangeStartDate || !rangeEndDate) return '';
	const fmt = (yyyyMmDdStr: string) => {
		const [y, m, d] = yyyyMmDdStr.split('-').map((x) => Number(x));
		if (!y || !m || !d) return yyyyMmDdStr;
		const mm = String(m).padStart(2, '0');
		const dd = String(d).padStart(2, '0');
		return `${mm}/${dd}/${y}`;
	};
	if (granularity === 'month') return rangeStartDate.slice(0, 7);
	if (granularity === 'day') return fmt(rangeStartDate);
	return `${fmt(rangeStartDate)} → ${fmt(rangeEndDate)}`;
}

export function temporalToUtcYyyyMmDd(x: unknown): string {
	if (typeof x === 'string') {
		if (/^\d{4}-\d{2}-\d{2}$/.test(x)) return x;
		const m = /^(\d{4}-\d{2}-\d{2})/.exec(x);
		if (m) return m[1]!;
		return x;
	}
	if (!x || typeof x !== 'object') return '';

	try {
		const zdt = Temporal.ZonedDateTime.from(x as Temporal.ZonedDateTime);
		return zdt.toInstant().toZonedDateTimeISO('UTC').toPlainDate().toString();
	} catch {
		// fall through
	}

	try {
		return Temporal.PlainDate.from(x as Temporal.PlainDate).toString();
	} catch {
		return '';
	}
}

// --- Calendar events from posts ---

const BUCKET_MINUTES = 30;
const VISUAL_MINUTES = 30;

function isoToUtcZdt(iso: string): Temporal.ZonedDateTime {
	return Temporal.Instant.from(iso).toZonedDateTimeISO('UTC');
}

function publishMs(iso: string): number {
	const ms = Date.parse(iso);
	return Number.isFinite(ms) ? ms : Number.NaN;
}

function slotSummaryEntry(
	p: CalendarPostRowViewModel,
	channelById: Map<string, ChannelViewModel>
): SchedulerSlotSummaryEntry {
	const integrationId = p.integrationId ?? '';
	const display = integrationId
		? resolvePostChannelDisplay(integrationId, p, channelById)
		: { integrationId: '', picture: null, name: '', identifier: 'generic' };
	return {
		postId: p.id ?? '',
		postGroup: p.postGroup ?? '',
		integrationId,
		state: typeof p.state === 'string' ? p.state : '',
		publishDate: p.publishDate ?? '',
		content: stripHtmlToPlainText(String(p.content ?? '')).slice(0, 140),
		channelPicture: display.picture ?? '',
		channelName: display.name,
		channelIdentifier: display.identifier
	};
}

function roundToBucketStart(zdt: Temporal.ZonedDateTime): Temporal.ZonedDateTime {
	const roundedMinute = Math.floor(zdt.minute / BUCKET_MINUTES) * BUCKET_MINUTES;
	return zdt.with({
		minute: roundedMinute,
		second: 0,
		millisecond: 0,
		microsecond: 0,
		nanosecond: 0
	});
}

function bucketKey(bucketStart: Temporal.ZonedDateTime): string {
	return `${bucketStart.toPlainDate().toString()}|${bucketStart.hour}:${bucketStart.minute}`;
}

function createEventForPost(
	p: CalendarPostRowViewModel,
	bucketStart: Temporal.ZonedDateTime,
	channelById: Map<string, ChannelViewModel>
): SchedulerCalendarEvent {
	const end = bucketStart.add({ minutes: Math.max(BUCKET_MINUTES, VISUAL_MINUTES) });
	const display = p.integrationId
		? resolvePostChannelDisplay(p.integrationId, p, channelById)
		: null;
	const channel = display ? channelVmFromDisplay(display, channelById) : null;

	return {
		id: p.id,
		title: display?.name || 'Draft',
		start: bucketStart,
		end,
		channel,
		post: p,
		posts: [p],
		slotSummary: [slotSummaryEntry(p, channelById)]
	};
}

function appendPostToEvent(
	ev: SchedulerCalendarEvent,
	p: CalendarPostRowViewModel,
	channelById: Map<string, ChannelViewModel>
): void {
	ev.posts = [...(ev.posts ?? []), p];
	ev.slotSummary = [...(ev.slotSummary ?? []), slotSummaryEntry(p, channelById)];
}

function pickRepresentativePost(posts: CalendarPostRowViewModel[]): CalendarPostRowViewModel | null {
	const nowMs = Date.now();
	const sorted = posts
		.map((p) => ({
			p,
			ms: typeof p.publishDate === 'string' ? publishMs(p.publishDate) : Number.NaN
		}))
		.filter((x) => Number.isFinite(x.ms))
		.sort((a, b) => a.ms - b.ms);
	if (sorted.length === 0) return null;

	const nextFuture = sorted.find((x) => x.ms >= nowMs);
	return (nextFuture ?? sorted[sorted.length - 1]!).p;
}

function applyRepresentativeToEvent(
	ev: SchedulerCalendarEvent,
	channelById: Map<string, ChannelViewModel>
): void {
	const posts = ev.posts ?? [];
	if (posts.length === 0) return;

	const representative = pickRepresentativePost(posts);
	if (!representative) return;

	ev.post = representative;
	const repDisplay = representative.integrationId
		? resolvePostChannelDisplay(representative.integrationId, representative, channelById)
		: null;
	ev.channel = repDisplay ? channelVmFromDisplay(repDisplay, channelById) : null;
	ev.title = repDisplay?.name || 'Draft';

	const summary = ev.slotSummary ?? [];
	if (summary.length <= 1) return;

	const repId = String(representative.id ?? '');
	ev.slotSummary = summary
		.map((s) => ({
			s,
			ms: typeof s.publishDate === 'string' ? publishMs(s.publishDate) : Number.NaN
		}))
		.sort((a, b) => {
			const aIsRep = repId.length > 0 && String(a.s.postId) === repId;
			const bIsRep = repId.length > 0 && String(b.s.postId) === repId;
			if (aIsRep && !bIsRep) return -1;
			if (!aIsRep && bIsRep) return 1;
			if (Number.isFinite(a.ms) && Number.isFinite(b.ms)) return a.ms - b.ms;
			if (Number.isFinite(a.ms)) return -1;
			if (Number.isFinite(b.ms)) return 1;
			return 0;
		})
		.map((x) => x.s);
}

export function buildCalendarEventsFromPosts(
	posts: readonly CalendarPostRowViewModel[],
	channelById: Map<string, ChannelViewModel>
): SchedulerCalendarEvent[] {
	const bucketed = new Map<string, SchedulerCalendarEvent>();

	for (const p of posts) {
		if (typeof p.publishDate !== 'string' || p.publishDate.length === 0) continue;

		const bucketStart = roundToBucketStart(isoToUtcZdt(p.publishDate));
		const key = bucketKey(bucketStart);
		const existing = bucketed.get(key);

		if (existing) {
			appendPostToEvent(existing, p, channelById);
			continue;
		}

		bucketed.set(key, createEventForPost(p, bucketStart, channelById));
	}

	for (const ev of bucketed.values()) {
		applyRepresentativeToEvent(ev, channelById);
	}

	return Array.from(bucketed.values());
}
