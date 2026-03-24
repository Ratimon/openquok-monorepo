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
