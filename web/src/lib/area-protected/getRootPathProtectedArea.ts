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

/**
 * Analytics route segment under the account area (compose with {@link getRootPathAccount}, e.g.
 * `${absoluteUrl(getRootPathAccount())}/${getRootPathAnalytics()}`).
 */
export function getRootPathAnalytics(): string {
	return 'analytics';
}

/**
 * Media library segment under the account area (compose with {@link getRootPathAccount}, e.g.
 * `${absoluteUrl(getRootPathAccount())}/${getRootPathMedia()}`).
 */
export function getRootPathMedia(): string {
	return 'media';
}

/**
 * Integrations route segment under the account area (compose with {@link getRootPathAccount}, e.g.
 * `${absoluteUrl(getRootPathAccount())}/${getRootPathIntegrations()}`).
 */
export function getRootPathIntegrations(): string {
	return 'integrations';
}

/** Plugs (channel automation) segment under the account area. */
export function getRootPathPlugs(): string {
	return 'plugs';
}

/** Content sets (saved composer presets) segment under the account area. */
export function getRootPathTemplates(): string {
	return 'templates';
}
