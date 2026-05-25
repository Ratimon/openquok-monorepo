import { GetChannelPresenter } from '$lib/channels/GetChannel.presenter.svelte';

export const getChannelPresenter = new GetChannelPresenter();

export { GetChannelPresenter } from '$lib/channels/GetChannel.presenter.svelte';

export type {
	CreateSocialPostChannelViewModel,
	HomeChannelGroupViewModel,
	HomeChannelsLayoutModeViewModel,
	HomeConnectedChannelMenuGroupViewModel,
	HomePlatformChannelRowViewModel,
	PostingTimeSlotViewModel,
	WorkspaceChannelGroupViewModel
} from '$lib/channels/GetChannel.presenter.svelte';

export {
	HOME_CHANNEL_UNGROUPED_GROUP_LABEL,
	HomeChannelsGridTablePresenter,
	type HomeChannelTableRowViewModel
} from '$lib/channels/HomeChannelsGridTable.presenter.svelte';

export {
	createHomeChannelsGridTableFilter,
	HomeChannelsGridFilterBuilderPresenter,
	HOME_CHANNELS_GRID_FILTER_BUILDER_FIELDS
} from '$lib/channels/HomeChannelsGridFilterBuilder.presenter.svelte';
