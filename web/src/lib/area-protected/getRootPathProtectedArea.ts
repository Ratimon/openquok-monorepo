/**
 * Root path for the default protected account home (first page when authenticated).
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
 * Plugs (channel automation) segment under the account area.
 */
export function getRootPathPlugs(): string {
	return 'plugs';
}

/** Content sets (saved composer presets) segment under the account area. */
export function getRootPathTemplates(): string {
	return 'templates';
}

/** Payload wizard segment under the account area (build API create-post JSON). */
export function getRootPathPayloadWizard(): string {
	return 'payload-wizard';
}

/** Bookmarked extensions segment under the account area. */
export function getRootPathExtensions(): string {
	return 'extensions';
}

/** User-submitted stacks under the account area. */
export function getRootPathStacks(): string {
	return 'stacks';
}

/** User-submitted extensions under the account area. */
export function getRootPathMyExtensions(): string {
	return 'my-extensions';
}

export function getRootPathNewStack(): string {
	return 'new';
}

export function getRootPathNewExtension(): string {
	return 'new';
}

export function getAccountStackEditorPath(stackId: string): string {
	return `${getRootPathStacks()}/${stackId}`;
}

export function getAccountExtensionEditorPath(extensionId: string): string {
	return `${getRootPathMyExtensions()}/${extensionId}`;
}
