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
	successToast: string;
	/** Value for `?added=` on the account success redirect. */
	addedQueryProvider: string;
	fallbackIcon: IconName;
	validateRow: (row: ContinueConnectPageRow) => string | null;
	toSaveParams: (row: ContinueConnectPageRow) => ContinueProviderSaveParams;
};

export type TwoStepPickerViewModel = {
	provider: string;
	organizationId: string;
	integrationId: string;
	oauthState: string;
	pages: ContinueConnectPageRow[];
	successReturnPath: string;
	onboarding: boolean;
};
