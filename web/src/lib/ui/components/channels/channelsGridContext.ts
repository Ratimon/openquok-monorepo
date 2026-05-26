import type { CreateSocialPostChannelViewModel } from '$lib/channels/GetChannel.presenter.svelte';

export const channelsGridActionsKey = Symbol('channelsGridActions');

export const channelsGridLimitKey = Symbol('channelsGridLimit');

export type ChannelsGridActions = {
	openActions: (integration: CreateSocialPostChannelViewModel) => void;
	addMoreChannel: (platformIdentifier: string) => void;
};

/** Reactive channel-cap state for grid cells (see {@link channelsGridLimitKey}). */
export type ChannelsGridLimitContext = {
	isChannelLimitFull: () => boolean;
};
