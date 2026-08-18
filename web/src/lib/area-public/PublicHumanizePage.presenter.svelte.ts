import type { HumanizeToolPageViewModel } from '$lib/ai-humanize/Humanize.presenter.svelte';

import {
	getHumanizeChannelBySlug,
	PUBLIC_HUMANIZE_GENERIC_CONFIG
} from '$lib/ai-humanize/constants/publicHumanizeChannelConfig';

export class PublicHumanizePagePresenter {
	loadHumanizeVm(params: { channelSlug?: string | null } = {}): HumanizeToolPageViewModel {
		const channelSlug = params.channelSlug?.trim().toLowerCase() || null;
		const channelConfig = channelSlug ? getHumanizeChannelBySlug(channelSlug) : undefined;
		const generic = PUBLIC_HUMANIZE_GENERIC_CONFIG;

		return {
			metaTitle: channelConfig?.metaTitle ?? generic.metaTitle,
			metaDescription: channelConfig?.metaDescription ?? generic.metaDescription,
			channelSlug: channelConfig?.channelSlug ?? null,
			channelLabel: channelConfig?.platformLabel ?? null,
			focusedProviderIdentifier: channelConfig?.focusedProviderIdentifier ?? null,
			composerMode: channelConfig ? 'custom' : 'global'
		};
	}
}
