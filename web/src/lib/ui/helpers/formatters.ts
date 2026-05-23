/**
 * Format date with time (e.g. 2023-01-01T00:00:00Z -> Jan 1, 2023, 12:00 AM)
 */
export function formatDate(dateString: string): string {
	const date = new Date(dateString);
	if (Number.isNaN(date.getTime())) return dateString;
	return new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric'
	}).format(date);
}

/**
 * Format date without time (e.g. 2023-01-01T00:00:00Z -> Jan 1, 2023)
 */
export function formatDateShort(dateString: string): string {
	const date = new Date(dateString);
	if (Number.isNaN(date.getTime())) return dateString;
	return new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	}).format(date);
}

/** Parse API/Stripe instants as UTC when the string has no timezone offset. */
function parseBillingInstant(dateString: string): Date {
	const trimmed = dateString.trim();
	if (!trimmed) return new Date(NaN);
	const hasTimezone = /[zZ]$|[+-]\d{2}(?::?\d{2})?$/.test(trimmed);
	return new Date(hasTimezone ? trimmed : `${trimmed}Z`);
}

/** Subscription cancel / downgrade date in local time (e.g. `23 May, 2026`). */
export function formatSubscriptionCancelDate(dateString: string): string {
	const date = parseBillingInstant(dateString);
	if (Number.isNaN(date.getTime())) return dateString;
	const day = date.getDate();
	const month = date.toLocaleDateString('en-US', { month: 'short' });
	return `${day} ${month}, ${date.getFullYear()}`;
}
