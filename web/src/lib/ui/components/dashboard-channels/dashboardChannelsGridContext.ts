import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';

export const dashboardChannelsGridActionsKey = Symbol('dashboardChannelsGridActions');

export type DashboardChannelsGridActions = {
	openActions: (integration: CreateSocialPostChannelViewModel) => void;
	addMoreChannel: (platformIdentifier: string) => void;
};
