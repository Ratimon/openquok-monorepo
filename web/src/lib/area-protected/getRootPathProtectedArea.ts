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

/** Playbooks hub segment under the account area (browse, bookmarks, owned playbooks & building blocks). */
export function getRootPathPlaybooksHub(): string {
	return 'playbooks';
}

/** Building block editor segment under {@link getRootPathPlaybooksHub}. */
export function getRootPathBuildingBlockEditor(): string {
	return 'building-block';
}

/** Playbook editor segment under {@link getRootPathPlaybooksHub}. */
export function getRootPathPlaybookEditor(): string {
	return 'playbook';
}

/** New listing editor segment (`…/building-block/new`, `…/playbook/new`). */
export function getRootPathNewListing(): string {
	return 'new';
}

/** Choose a public creator username (onboarding). */
export function getRootPathChooseUsername(): string {
	return 'choose-username';
}

/** Account playbooks hub: `/account/playbooks`. */
export function getAccountPlaybooksHubPath(): string {
	return getRootPathPlaybooksHub();
}

/** New building block editor: `/account/playbooks/building-block/new`. */
export function getAccountNewBuildingBlockPath(): string {
	return `${getRootPathPlaybooksHub()}/${getRootPathBuildingBlockEditor()}/${getRootPathNewListing()}`;
}

/** New playbook editor: `/account/playbooks/playbook/new`. */
export function getAccountNewPlaybookPath(): string {
	return `${getRootPathPlaybooksHub()}/${getRootPathPlaybookEditor()}/${getRootPathNewListing()}`;
}

/** Edit building block: `/account/playbooks/building-block/[id]`. */
export function getAccountBuildingBlockEditorPath(buildingBlockId: string): string {
	return `${getRootPathPlaybooksHub()}/${getRootPathBuildingBlockEditor()}/${buildingBlockId}`;
}

/** Edit playbook: `/account/playbooks/playbook/[id]`. */
export function getAccountPlaybookEditorPath(playbookId: string): string {
	return `${getRootPathPlaybooksHub()}/${getRootPathPlaybookEditor()}/${playbookId}`;
}
