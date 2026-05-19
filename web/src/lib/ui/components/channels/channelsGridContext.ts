import type { CreateSocialPostChannelViewModel } from '$lib/channels/GetChannel.presenter.svelte';

export const channelsGridActionsKey = Symbol('channelsGridActions');

export type ChannelsGridActions = {
	openActions: (integration: CreateSocialPostChannelViewModel) => void;
	addMoreChannel: (platformIdentifier: string) => void;
};
