import 'temporal-polyfill/global';

import type { CalendarGranularityViewModel } from '$lib/posts/scheduler.types';

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
