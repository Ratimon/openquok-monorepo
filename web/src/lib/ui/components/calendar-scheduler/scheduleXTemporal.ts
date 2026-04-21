import 'temporal-polyfill/global';

/**
 * Convert an ISO timestamp (from API) to a Temporal.ZonedDateTime in UTC.
 * Schedule‑X wants Temporal objects; we use UTC to avoid implicit local TZ shifts.
 */
export function isoToUtcZdt(iso: string): Temporal.ZonedDateTime {
	const instant = Temporal.Instant.from(iso);
	return instant.toZonedDateTimeISO('UTC');
}

/** Calendar day in UTC for API queries / labels (matches our `YYYY-MM-DD` range model). */
export function temporalToUtcYyyyMmDd(x: unknown): string {
	if (typeof x === 'string') {
		// Sometimes schedule-x passes ISO strings; normalize to a date-only prefix when possible.
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

