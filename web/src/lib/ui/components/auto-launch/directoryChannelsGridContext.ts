import type { ProductDirectoryChannelTableRowViewModel } from '$lib/auto-launch/ProductDirectoryChannelsGridTable.presenter.svelte';

export const directoryChannelsGridContextKey = Symbol('directoryChannelsGridContext');

export type DirectoryChannelsGridContext = {
	productProfileId: string;
	organizationId: string;
	openListingDetails: (
		row: ProductDirectoryChannelTableRowViewModel,
		mode: 'complete' | 'edit'
	) => void;
	toggleSiteExpanded: (siteKey: string) => void;
	requestRemoveCompletion: (row: ProductDirectoryChannelTableRowViewModel) => void;
};
