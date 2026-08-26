import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';
import { xMaxCharactersForChannel } from './xWeightedLength';
import { getLaunchProviderConfig } from '$lib/ui/components/posts/providers';

type ChannelCharLimitSource = Pick<
	CreateSocialPostChannelViewModel,
	'identifier' | 'additionalSettings'
>;

/** Maximum caption length for one connected channel (X uses verified-aware limits). */
export function maxCharactersForChannel(channel: ChannelCharLimitSource | null | undefined): number {
	if (!channel) return getLaunchProviderConfig(null).maximumCharacters;
	const id = (channel.identifier ?? '').toLowerCase();
	if (id === 'x') return xMaxCharactersForChannel(channel);
	return getLaunchProviderConfig(channel.identifier).maximumCharacters;
}

/** Tightest caption limit across the currently selected channels (Global Edit). */
export function computeSoftCharLimitAcrossSelected(args: {
	selectedIds: string[];
	baseSocialChannelsVm: CreateSocialPostChannelViewModel[];
}): number {
	let min: number | null = null;
	for (const id of args.selectedIds) {
		const ch = args.baseSocialChannelsVm.find((c) => c.id === id);
		if (!ch) continue;
		const limit = maxCharactersForChannel(ch);
		min = min === null ? limit : Math.min(min, limit);
	}
	return min ?? getLaunchProviderConfig(null).maximumCharacters;
}

export function selectedIdsIncludeXChannel(
	selectedIds: string[],
	baseSocialChannelsVm: CreateSocialPostChannelViewModel[]
): boolean {
	for (const id of selectedIds) {
		const ch = baseSocialChannelsVm.find((c) => c.id === id);
		if ((ch?.identifier ?? '').toLowerCase() === 'x') return true;
	}
	return false;
}
