import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';
import type { CreateSocialPostMode } from '$lib/posts/createSocialPost.types';
import { stripComposerBodyForEditor } from './stripBodyForEditor';
import { xMaxCharactersForChannel, xWeightedLength } from './xWeightedLength';
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

function resolveChannelScheduleBody(args: {
	mode: CreateSocialPostMode;
	integrationId: string;
	globalBody: string;
	bodiesByIntegrationId: Record<string, string>;
}): string {
	if (args.mode === 'custom') {
		return args.bodiesByIntegrationId[args.integrationId] ?? args.globalBody;
	}
	return args.globalBody;
}

function measureChannelCaptionLength(
	channel: Pick<CreateSocialPostChannelViewModel, 'identifier' | 'editor'>,
	rawBody: string
): number {
	const stripped = stripComposerBodyForEditor(channel.editor ?? 'normal', rawBody);
	const id = (channel.identifier ?? '').toLowerCase();
	if (id === 'x') return xWeightedLength(stripped);
	return stripped.length;
}

/** Per-channel caption caps when scheduling (custom mode bodies + global fallback). */
export function validateScheduledCaptionsForChannels(args: {
	mode: CreateSocialPostMode;
	selectedIds: string[];
	baseSocialChannelsVm: CreateSocialPostChannelViewModel[];
	globalBody: string;
	bodiesByIntegrationId: Record<string, string>;
}): string | null {
	for (const id of args.selectedIds) {
		const ch = args.baseSocialChannelsVm.find((c) => c.id === id);
		if (!ch) continue;

		const rawBody = resolveChannelScheduleBody({
			mode: args.mode,
			integrationId: id,
			globalBody: args.globalBody,
			bodiesByIntegrationId: args.bodiesByIntegrationId
		});
		const stripped = stripComposerBodyForEditor(ch.editor ?? 'normal', rawBody);
		if (!stripped) continue;

		const limit = maxCharactersForChannel(ch);
		const used = measureChannelCaptionLength(ch, rawBody);
		if (used > limit) {
			const label = (ch.name ?? ch.identifier ?? 'Channel').trim() || 'Channel';
			return `${label} caption exceeds ${limit} characters (${used}/${limit}).`;
		}
	}
	return null;
}
