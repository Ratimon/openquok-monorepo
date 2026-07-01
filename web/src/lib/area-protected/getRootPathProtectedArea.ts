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

/** Extensions hub segment under the account area (bookmarks, owned listings, editors). */
export function getRootPathExtensions(): string {
	return 'extensions';
}

/** Extension editor segment under {@link getRootPathExtensions}. */
export function getRootPathExtensionEditor(): string {
	return 'extension';
}

/** Stack editor segment under {@link getRootPathExtensions}. */
export function getRootPathStackEditor(): string {
	return 'stack';
}

/** New listing editor segment (`…/extension/new`, `…/stack/new`). */
export function getRootPathNewListing(): string {
	return 'new';
}

/** Account extensions hub: `/account/extensions`. */
export function getAccountExtensionsHubPath(): string {
	return getRootPathExtensions();
}

/** New extension editor: `/account/extensions/extension/new`. */
export function getAccountNewExtensionPath(): string {
	return `${getRootPathExtensions()}/${getRootPathExtensionEditor()}/${getRootPathNewListing()}`;
}

/** New stack editor: `/account/extensions/stack/new`. */
export function getAccountNewStackPath(): string {
	return `${getRootPathExtensions()}/${getRootPathStackEditor()}/${getRootPathNewListing()}`;
}

/** Edit extension: `/account/extensions/extension/[id]`. */
export function getAccountExtensionEditorPath(extensionId: string): string {
	return `${getRootPathExtensions()}/${getRootPathExtensionEditor()}/${extensionId}`;
}

/** Edit stack: `/account/extensions/stack/[id]`. */
export function getAccountStackEditorPath(stackId: string): string {
	return `${getRootPathExtensions()}/${getRootPathStackEditor()}/${stackId}`;
}
