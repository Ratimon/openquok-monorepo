import type { CreateSocialPostChannelViewModel } from '$lib/channels/GetChannel.presenter.svelte';

export const dashboardChannelsGridActionsKey = Symbol('dashboardChannelsGridActions');

export type DashboardChannelsGridActions = {
	openActions: (integration: CreateSocialPostChannelViewModel) => void;
	addMoreChannel: (platformIdentifier: string) => void;
};
