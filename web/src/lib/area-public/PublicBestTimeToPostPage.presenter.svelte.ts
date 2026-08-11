import {
	getBestTimeChannelBySlug,
	PUBLIC_BEST_TIME_GENERIC_CONFIG,
	type BestTimeToolPageViewModel
} from '$lib/best-time-to-post';

export class PublicBestTimeToPostPagePresenter {
	loadBestTimeToPostVm(params: { channelSlug?: string | null }): BestTimeToolPageViewModel {
		const channelSlug = params.channelSlug?.trim().toLowerCase() || null;
		const channelConfig = channelSlug ? getBestTimeChannelBySlug(channelSlug) : undefined;
		const generic = PUBLIC_BEST_TIME_GENERIC_CONFIG;

		return {
			metaTitle: channelConfig?.metaTitle ?? generic.metaTitle,
			metaDescription: channelConfig?.metaDescription ?? generic.metaDescription,
			channelSlug: channelConfig?.channelSlug ?? null,
			channelLabel: channelConfig?.platformLabel ?? null,
			focusedProviderIdentifier: channelConfig?.focusedProviderIdentifier ?? null,
			defaultPlatformSlug: channelConfig?.channelSlug ?? generic.defaultPlatformSlug
		};
	}
}
