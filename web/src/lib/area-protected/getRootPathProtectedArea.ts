/**
 * Root path for the default protected account/dashboard (first page when authenticated).
 */
export function getRootPathAccount(): string {
	return 'account';
}

/**
 * Calendar route segment under the protected app (compose posts / schedule).
 */
export function getRootPathCalendar(): string {
	return 'calendar';
}
