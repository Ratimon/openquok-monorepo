import {
	getPublicChannelBySlug,
	type PublicChannelLandingPageViewModel
} from '$lib/content/constants/channels';
import {
	PUBLIC_LANDING_COMPACT_TRIAL_CTA,
	PUBLIC_LANDING_HERO_TRIAL_CTA
} from '$lib/content/constants/landing/hero-copy';

export type PublicChannelViewModel = PublicChannelLandingPageViewModel;

export class PublicChannelByPagePresenter {
	public channelVm: PublicChannelViewModel | null = $state(null);

	readonly heroCtaText = PUBLIC_LANDING_HERO_TRIAL_CTA;
	readonly featureCtaText = PUBLIC_LANDING_COMPACT_TRIAL_CTA;
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
