import { GetChannelPresenter } from '$lib/channels/GetChannel.presenter.svelte';

export const getChannelPresenter = new GetChannelPresenter();

export { GetChannelPresenter } from '$lib/channels/GetChannel.presenter.svelte';

export type {
	CreateSocialPostChannelViewModel,
	DashboardChannelGroupViewModel,
	DashboardChannelsLayoutModeViewModel,
	DashboardConnectedChannelMenuGroupViewModel,
	DashboardPlatformChannelRowViewModel,
	PostingTimeSlotViewModel,
	WorkspaceChannelGroupViewModel
} from '$lib/channels/GetChannel.presenter.svelte';

export {
	DASHBOARD_CHANNEL_UNGROUPED_GROUP_LABEL,
	DashboardChannelsGridTablePresenter,
	type DashboardChannelTableRowViewModel
} from '$lib/channels/DashboardChannelsGridTable.presenter.svelte';

export {
	createDashboardChannelsGridTableFilter,
	DashboardChannelsGridFilterBuilderPresenter,
	DASHBOARD_CHANNELS_GRID_FILTER_BUILDER_FIELDS
} from '$lib/channels/DashboardChannelsGridFilterBuilder.presenter.svelte';
