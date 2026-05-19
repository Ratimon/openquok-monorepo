import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';
import type { PostMediaViewModel } from '$lib/posts/Post.repository.svelte';
import { formatProviderScheduleValidationMessage } from '$lib/posts/utils/createSocialPostChannel';
import { getLaunchProviderConfig } from '$lib/ui/components/posts/providers';
import type { LaunchProviderCommentsMode } from '$lib/ui/components/posts/providers/provider.types';

export function computeLaunchCommentsMode(args: {
	selectedIds: string[];
	baseSocialChannelsVm: CreateSocialPostChannelViewModel[];
}): LaunchProviderCommentsMode {
	let out: LaunchProviderCommentsMode = true;
	for (const id of args.selectedIds) {
		const ch = args.baseSocialChannelsVm.find((c) => c.id === id);
		if (!ch) continue;
		const cfg = getLaunchProviderConfig(ch.identifier);
		if (typeof cfg.comments === 'undefined') continue;
		if (cfg.comments === 'no-media') {
			out = 'no-media';
		}
	}
	return out;
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
