import 'temporal-polyfill/global';

export const CALENDAR_POST_DRAG_MIME = 'application/x-openquok-calendar-post';

export type CalendarPostDragPayload = {
	postId: string;
	postGroup: string;
	state: string;
	intervalInDays?: number | null;
	sourcePublishDateIso: string;
};

let activeCalendarPostDrag: CalendarPostDragPayload | null = null;
let suppressCalendarChipClick = false;

export function setActiveCalendarPostDrag(payload: CalendarPostDragPayload | null): void {
	activeCalendarPostDrag = payload;
}

/** CalendarView listens in capture phase — suppress the click that follows dragend. */
export function markCalendarChipClickSuppressed(): void {
	suppressCalendarChipClick = true;
	window.setTimeout(() => {
		suppressCalendarChipClick = false;
	}, 0);
}

export function shouldSuppressCalendarChipClick(): boolean {
	return suppressCalendarChipClick;
}

export function getActiveCalendarPostDrag(): CalendarPostDragPayload | null {
	return activeCalendarPostDrag;
}

export function serializeCalendarPostDrag(payload: CalendarPostDragPayload): string {
	return JSON.stringify(payload);
}

function parsePayloadJson(raw: string): CalendarPostDragPayload | null {
	try {
		const parsed = JSON.parse(raw) as CalendarPostDragPayload;
		if (
			typeof parsed.postId === 'string' &&
			parsed.postId &&
			typeof parsed.postGroup === 'string' &&
			parsed.postGroup &&
			typeof parsed.state === 'string' &&
			typeof parsed.sourcePublishDateIso === 'string' &&
			parsed.sourcePublishDateIso
		) {
			return {
				postId: parsed.postId,
				postGroup: parsed.postGroup,
				state: parsed.state,
				intervalInDays: parsed.intervalInDays ?? null,
				sourcePublishDateIso: parsed.sourcePublishDateIso
			};
		}
	} catch {
		return null;
	}
	return null;
}

export function parseCalendarPostDrag(
	dataTransfer: DataTransfer | null,
	fallback?: CalendarPostDragPayload | null
): CalendarPostDragPayload | null {
	if (fallback) return fallback;
	if (!dataTransfer) return null;
	const raw =
		dataTransfer.getData(CALENDAR_POST_DRAG_MIME) || dataTransfer.getData('text/plain');
	if (!raw) return null;
	return parsePayloadJson(raw);
}

export function normalizePostState(state: string): string {
	return String(state ?? '').trim().toUpperCase();
}

/** Single-post chips in DRAFT, QUEUE (scheduled), or PUBLISHED may be dragged. */
export function canDragCalendarPost(params: { multiPosts: boolean; state: string }): boolean {
	if (params.multiPosts) return false;
	const s = normalizePostState(params.state);
	if (s === 'ERROR') return false;
	return s === 'DRAFT' || s === 'QUEUE' || s === 'PUBLISHED';
}

export function isPastPublishInstant(publishDateIso: string, nowMs = Date.now()): boolean {
	const t = Date.parse(publishDateIso);
	return Number.isFinite(t) && t < nowMs;
}

/** Published rows and past-due scheduled rows need an explicit update vs reschedule choice. */
export function isRescheduleConfirmationRequired(
	state: string,
	sourcePublishDateIso: string,
	nowMs = Date.now()
): boolean {
	const s = normalizePostState(state);
	if (s === 'PUBLISHED') return true;
	if (s === 'QUEUE' && isPastPublishInstant(sourcePublishDateIso, nowMs)) return true;
	return false;
}

export function isRecurringPost(intervalInDays?: number | null): boolean {
	const n = typeof intervalInDays === 'number' ? intervalInDays : Number(intervalInDays);
	return Number.isFinite(n) && n > 0;
}

/** Drop target must be in the future (same minimum lead time as empty-slot create). */
export function canDropOnSlot(targetPublishDateIso: string, nowMs = Date.now()): boolean {
	const t = Date.parse(targetPublishDateIso);
	if (!Number.isFinite(t)) return false;
	const min = nowMs + 5 * 60 * 1000;
	return t >= min;
}

/** Snap pointer position within a day column to a 30-minute slot (UTC). */
export function scheduledIsoFromTimeGridDay(dayEl: HTMLElement, clientY: number): string | null {
	const dateStr = dayEl.getAttribute('data-time-grid-date') ?? '';
	if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;

	const rect = dayEl.getBoundingClientRect();
	const y = clientY - rect.top;
	const frac = Math.min(1, Math.max(0, y / rect.height));
	const totalMinutes = Math.floor(frac * 24 * 60);
	const snappedMinutes = Math.min(24 * 60 - 30, Math.floor(totalMinutes / 30) * 30);
	const hour = Math.floor(snappedMinutes / 60);
	const minute = snappedMinutes % 60;

	try {
		const dt = Temporal.ZonedDateTime.from(
			`${dateStr}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00+00:00[UTC]`
		);
		const now = Temporal.Now.zonedDateTimeISO('UTC');
		const min = now.add({ minutes: 5 });
		if (Temporal.ZonedDateTime.compare(dt, min) < 0) return null;
		if (Temporal.ZonedDateTime.compare(dt, now) <= 0) return null;
		return dt.toInstant().toString();
	} catch {
		return null;
	}
}

/** Month view: move to another day while preserving wall-clock time from the source post. */
export function scheduledIsoFromMonthGridDay(
	dayDateStr: string,
	sourcePublishDateIso: string
): string | null {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(dayDateStr)) return null;
	const sourceMs = Date.parse(sourcePublishDateIso);
	if (!Number.isFinite(sourceMs)) return null;

	const source = new Date(sourceMs);
	const hour = source.getUTCHours();
	const minute = source.getUTCMinutes();

	try {
		const dt = Temporal.ZonedDateTime.from(
			`${dayDateStr}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00+00:00[UTC]`
		);
		const now = Temporal.Now.zonedDateTimeISO('UTC');
		const min = now.add({ minutes: 5 });
		if (Temporal.ZonedDateTime.compare(dt, min) < 0) return null;
		if (Temporal.ZonedDateTime.compare(dt, now) <= 0) return null;
		return dt.toInstant().toString();
	} catch {
		return null;
	}
}
