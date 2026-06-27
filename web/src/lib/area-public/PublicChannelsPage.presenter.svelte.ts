import {
	listPublicChannelsForHub,
	type PublicChannelLandingPageViewModel
} from '$lib/content/constants/publicChannelConfig';

import type { PublicChannelViewModel } from '$lib/area-public/PublicChannelByPage.presenter.svelte';

export type { PublicChannelViewModel };

export class PublicChannelsPagePresenter {
	public channelsVm: PublicChannelViewModel[] = $state([]);

	/** Stateless — safe for `+page.server.ts` (SSR): hub catalog → VM without mutating `$state`. */
	loadChannelsHubStateless(): PublicChannelViewModel[] {
		return listPublicChannelsForHub().map(toPublicChannelVm);
	}

	/** Stateful wrapper — calls {@link loadChannelsHubStateless} and assigns {@link channelsVm}. */
	loadChannelsHub(): PublicChannelViewModel[] {
		const channelsVm = this.loadChannelsHubStateless();
		this.channelsVm = channelsVm;
		return channelsVm;
	}
}

function toPublicChannelVm(page: PublicChannelLandingPageViewModel): PublicChannelViewModel {
	return page;
}
