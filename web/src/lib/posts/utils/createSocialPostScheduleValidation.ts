import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';
import type { PostMediaViewModel } from '$lib/posts/Post.repository.svelte';
import { formatProviderScheduleValidationMessage } from '$lib/posts/utils/createSocialPostChannel';
import { getLaunchProviderConfig } from '$lib/ui/components/posts/providers';
import {
	instagramMaxMediaItems,
	readInstagramLaunchSettings
} from '$lib/ui/components/posts/providers/instagram/instagram.provider';

/** Tightest main-post attachment cap across selected channels (`null` = no cap in the composer). */
export function computeLaunchMaxMediaItems(args: {
	selectedIds: string[];
	baseSocialChannelsVm: CreateSocialPostChannelViewModel[];
	providerSettingsByIntegrationId: Record<string, Record<string, unknown>>;
}): number | null {
	let cap: number | null = null;
	for (const id of args.selectedIds) {
		const ch = args.baseSocialChannelsVm.find((c) => c.id === id);
		if (!ch) continue;
		const ident = (ch.identifier ?? '').toLowerCase();
		if (!ident.startsWith('instagram')) continue;
		const limit = instagramMaxMediaItems(
			readInstagramLaunchSettings(args.providerSettingsByIntegrationId[id] ?? {})
		);
		cap = cap === null ? limit : Math.min(cap, limit);
	}
	return cap;
}

export function computeScheduleValidationError(args: {
	selectedIds: string[];
	baseSocialChannelsVm: CreateSocialPostChannelViewModel[];
	postMediaItems: PostMediaViewModel[];
	providerSettingsByIntegrationId: Record<string, Record<string, unknown>>;
}): string | null {
	if (!args.selectedIds.length) return null;
	for (const id of args.selectedIds) {
		const ch = args.baseSocialChannelsVm.find((c) => c.id === id);
		if (!ch) continue;
		const cfg = getLaunchProviderConfig(ch.identifier);
		if (!cfg.checkValidity) continue;
		const res = cfg.checkValidity({
			media: args.postMediaItems,
			settings: args.providerSettingsByIntegrationId[id] ?? {}
		});
		if (typeof res === 'string' && res.trim().length > 0) {
			return formatProviderScheduleValidationMessage(ch, res);
		}
	}
	return null;
}

/** Provider async checks (video duration, etc.) before scheduling. */
export async function computeScheduleValidationErrorAsync(args: {
	selectedIds: string[];
	baseSocialChannelsVm: CreateSocialPostChannelViewModel[];
	postMediaItems: PostMediaViewModel[];
	providerSettingsByIntegrationId: Record<string, Record<string, unknown>>;
}): Promise<string | null> {
	const sync = computeScheduleValidationError(args);
	if (sync) return sync;

	for (const id of args.selectedIds) {
		const ch = args.baseSocialChannelsVm.find((c) => c.id === id);
		if (!ch) continue;
		const cfg = getLaunchProviderConfig(ch.identifier);
		if (!cfg.checkValidityAsync) continue;
		const res = await cfg.checkValidityAsync({
			media: args.postMediaItems,
			settings: args.providerSettingsByIntegrationId[id] ?? {}
		});
		if (typeof res === 'string' && res.trim().length > 0) {
			return formatProviderScheduleValidationMessage(ch, res);
		}
	}
	return null;
}
