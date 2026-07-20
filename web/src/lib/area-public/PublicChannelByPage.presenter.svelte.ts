import {
	getPublicChannelBySlug,
	type PublicChannelLandingPageViewModel
} from '$lib/content/constants/publicChannelConfig';

export type PublicChannelViewModel = PublicChannelLandingPageViewModel;

export class PublicChannelByPagePresenter {
	public channelVm: PublicChannelViewModel | null = $state(null);

	readonly secondaryCtaText = 'Get Started For Free';
	readonly secondaryCtaHref = '/pricing';

	/**
	 * Stateless — safe for `+page.server.ts` (SSR): resolve slug → VM without mutating `$state`.
	 * Returns `null` when the slug is missing.
	 */
	loadChannelBySlugStateless(slug: string): PublicChannelViewModel | null {
		const channel = getPublicChannelBySlug(slug);
		return channel ? toPublicChannelVm(channel) : null;
	}

	/** Stateful wrapper — calls {@link loadChannelBySlugStateless} and assigns {@link channelVm}. */
	loadChannelBySlug(slug: string): PublicChannelViewModel | null {
		const channelVm = this.loadChannelBySlugStateless(slug);
		this.channelVm = channelVm;
		return channelVm;
	}
}

function toPublicChannelVm(page: PublicChannelLandingPageViewModel): PublicChannelViewModel {
	return page;
}
