import type { IconName } from '$data/icons';

/** Row returned on OAuth connect `pages` for two-step channel setup. */
export type ContinueConnectPageRow = {
	id: string;
	name: string;
	pictureUrl: string;
	/** Present for Instagram (Business); omitted for Facebook Page rows. */
	pageId?: string;
};

export type ContinueProviderSaveParams = {
	pageId: string;
	id: string;
};

/** Per-provider OAuth between-steps UI and save mapping. */
export type ContinueProviderStepConfig = {
	title: string;
	description: string;
	emptyPagesMessage: string;
	/** Shown when OAuth returned accounts but each one is already connected in the workspace. */
	allPagesConnectedMessage?: string;
	successToast: string;
	/** Value for `?added=` on the account success redirect. */
	addedQueryProvider: string;
	fallbackIcon: IconName;
	validateRow: (row: ContinueConnectPageRow) => string | null;
	toSaveParams: (row: ContinueConnectPageRow) => ContinueProviderSaveParams;
};

export type AccountConflictViewModel = {
	message: string;
	existingIntegrationId: string;
	existingProviderIdentifier: string;
	/** Display name for the conflicting account (e.g. @handle). */
	accountLabel?: string;
};

export type TwoStepPickerViewModel = {
	provider: string;
	organizationId: string;
	integrationId: string;
	oauthState: string;
	pages: ContinueConnectPageRow[];
	/** Unfiltered OAuth pages — used to refresh the picker after removing a conflicting channel. */
	allPages?: ContinueConnectPageRow[];
	/** When set, the picker shows this instead of selectable rows (e.g. all accounts already connected). */
	emptyStateMessage?: string;
	/** When set, offer one-click removal of the conflicting channel before continuing setup. */
	accountConflict?: AccountConflictViewModel;
	successReturnPath: string;
	onboarding: boolean;
};
