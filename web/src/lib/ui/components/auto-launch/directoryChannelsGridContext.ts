import type { ProductDirectoryChannelTableRowViewModel } from '$lib/auto-launch/ProductDirectoryChannelsGridTable.presenter.svelte';

export const directoryChannelsGridContextKey = Symbol('directoryChannelsGridContext');

export type DirectoryChannelsGridContext = {
	productProfileId: string;
	organizationId: string;
	variantProfileIdBySiteKey: Map<string, string>;
	openListingDetails: (
		row: ProductDirectoryChannelTableRowViewModel,
		mode: 'complete' | 'edit'
	) => void;
	toggleSiteExpanded: (siteKey: string) => void;
	requestRemoveCompletion: (row: ProductDirectoryChannelTableRowViewModel) => void;
	tailorBusySiteKey: string | null;
	tailorForDirectory: (row: ProductDirectoryChannelTableRowViewModel) => void | Promise<void>;
	openDirectoryVariant: (siteKey: string) => void;
};
