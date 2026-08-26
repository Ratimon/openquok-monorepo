import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';
import type { CreateSocialPostMode, ThreadFollowUpReply } from '$lib/posts/createSocialPost.types';
import type { SetSharedFollowUpReplyViewModel, SetSnapshotViewModel } from '$lib/sets/GetSet.presenter.svelte';

export function channelSupportsFollowUpComments(identifier: string | null | undefined): boolean {
	const id = (identifier ?? '').toLowerCase();
	return id === 'threads' || id === 'x' || id.startsWith('instagram');
}

export function followUpBucketForChannel(
	identifier: string | null | undefined
): 'threads' | 'instagram' | 'x' {
	const id = (identifier ?? '').trim().toLowerCase();
	if (id.startsWith('instagram')) return 'instagram';
	if (id === 'x') return 'x';
	return 'threads';
}

export function listThreadFollowUpSupportedIntegrationIds(args: {
	mode: CreateSocialPostMode;
	contentSetAuthoringActive: boolean;
	focusedIntegrationId: string | null;
	selectedIds: string[];
	baseSocialChannelsVm: CreateSocialPostChannelViewModel[];
}): string[] {
	if (args.contentSetAuthoringActive) return [];
	if (args.mode === 'custom') {
		const fid = args.focusedIntegrationId;
		if (!fid) return [];
		const ch = args.baseSocialChannelsVm.find((c) => c.id === fid);
		return channelSupportsFollowUpComments(ch?.identifier) ? [fid] : [];
	}
	return args.selectedIds.filter((sid) => {
		const ch = args.baseSocialChannelsVm.find((c) => c.id === sid);
		return channelSupportsFollowUpComments(ch?.identifier);
	});
}

export function getPrimaryThreadFollowUpIntegrationId(args: {
	contentSetAuthoringActive: boolean;
	selectedIds: string[];
	baseSocialChannelsVm: CreateSocialPostChannelViewModel[];
	supportedIntegrationIds: string[];
	providerSettingsByIntegrationId: Record<string, Record<string, unknown>>;
}): string | null {
	if (args.contentSetAuthoringActive) {
		return (
			args.selectedIds.find((sid) => {
				const ch = args.baseSocialChannelsVm.find((c) => c.id === sid);
				const id = (ch?.identifier ?? '').trim().toLowerCase();
				return id === 'threads' || id === 'x' || id.startsWith('instagram');
			}) ?? null
		);
	}
	const supporters = args.supportedIntegrationIds;
	if (supporters.length === 0) return null;
	for (const sid of supporters) {
		const raw = threadFollowUpRepliesRawForIntegration({
			integrationId: sid,
			baseSocialChannelsVm: args.baseSocialChannelsVm,
			providerSettingsByIntegrationId: args.providerSettingsByIntegrationId
		});
		if (raw.some((r) => (r.message ?? '').trim().length > 0)) return sid;
	}
	return supporters[0] ?? null;
}

export function threadFollowUpRepliesRawForIntegration(args: {
	integrationId: string;
	baseSocialChannelsVm: CreateSocialPostChannelViewModel[];
	providerSettingsByIntegrationId: Record<string, Record<string, unknown>>;
}): ThreadFollowUpReply[] {
	const ch = args.baseSocialChannelsVm.find((c) => c.id === args.integrationId);
	const bucket = followUpBucketForChannel(ch?.identifier);
	const settings = args.providerSettingsByIntegrationId[args.integrationId] ?? {};
	const block = (settings as Record<string, unknown>)[bucket];
	const rep = (block as { replies?: unknown } | undefined)?.replies;
	if (!Array.isArray(rep)) return [];
	return rep as ThreadFollowUpReply[];
}

/** Writes the same follow-up program to every selected Threads/Instagram channel (global multi-select). */
export function applyThreadFollowUpRepliesToSettings(args: {
	next: ThreadFollowUpReply[];
	targetIntegrationIds: string[];
	baseSocialChannelsVm: CreateSocialPostChannelViewModel[];
	providerSettingsByIntegrationId: Record<string, Record<string, unknown>>;
}): Record<string, Record<string, unknown>> {
	const { next, targetIntegrationIds, baseSocialChannelsVm } = args;
	if (targetIntegrationIds.length === 0) return args.providerSettingsByIntegrationId;
	const merged: Record<string, Record<string, unknown>> = { ...args.providerSettingsByIntegrationId };
	for (const intId of targetIntegrationIds) {
		const ch = baseSocialChannelsVm.find((c) => c.id === intId);
		const bucket = followUpBucketForChannel(ch?.identifier);
		const current = merged[intId] ?? {};
		const prevRaw = (current as Record<string, unknown>)[bucket];
		const bucketObj: Record<string, unknown> =
			prevRaw && typeof prevRaw === 'object' && !Array.isArray(prevRaw)
				? { ...(prevRaw as Record<string, unknown>) }
				: bucket === 'threads' || bucket === 'x'
					? { enabled: false, message: "That's a wrap!" }
					: {};
		merged[intId] = {
			...current,
			[bucket]: {
				...bucketObj,
				replies: next
			}
		};
	}
	return merged;
}

export function legacySharedRepliesFromProviderSnapshot(args: {
	snapshot: SetSnapshotViewModel;
	okIntegrationIds: string[];
	baseSocialChannelsVm: CreateSocialPostChannelViewModel[];
}): SetSharedFollowUpReplyViewModel[] {
	for (const intId of args.okIntegrationIds) {
		const ch = args.baseSocialChannelsVm.find((c) => c.id === intId);
		if (!channelSupportsFollowUpComments(ch?.identifier)) continue;
		const ident = (ch?.identifier ?? '').toLowerCase();
		const bucket: 'threads' | 'instagram' | 'x' = ident.startsWith('instagram')
			? 'instagram'
			: ident === 'x'
				? 'x'
				: 'threads';
		const ps = args.snapshot.providerSettingsByIntegrationId?.[intId];
		if (!ps) continue;
		const sub = ps[bucket] as Record<string, unknown> | undefined;
		const rep = sub?.replies;
		if (!Array.isArray(rep) || rep.length === 0) continue;
		return rep.map((r: unknown) => {
			const x = r as Record<string, unknown>;
			const id = typeof x.id === 'string' && x.id.length > 0 ? x.id : crypto.randomUUID();
			return {
				id,
				message: typeof x.message === 'string' ? x.message : '',
				delaySeconds: Number.isFinite(Number(x.delaySeconds))
					? Math.max(0, Math.floor(Number(x.delaySeconds)))
					: 0
			};
		});
	}
	return [];
}

/** Mirror `sharedFollowUpReplies` into every selected Threads/IG bucket (or clear replies). */
export function syncSharedFollowUpsToProviderSettingsForSetAuthoring(args: {
	base: Record<string, Record<string, unknown>>;
	sharedFollowUpReplies: SetSharedFollowUpReplyViewModel[];
	selectedIds: string[];
	baseSocialChannelsVm: CreateSocialPostChannelViewModel[];
}): Record<string, Record<string, unknown>> {
	const serial =
		args.sharedFollowUpReplies.length > 0
			? (JSON.parse(JSON.stringify(args.sharedFollowUpReplies)) as SetSharedFollowUpReplyViewModel[])
			: [];
	const out: Record<string, Record<string, unknown>> = JSON.parse(JSON.stringify(args.base));
	for (const intId of args.selectedIds) {
		const ch = args.baseSocialChannelsVm.find((c) => c.id === intId);
		if (!channelSupportsFollowUpComments(ch?.identifier)) continue;
		const ident = (ch?.identifier ?? '').toLowerCase();
		const bucket: 'threads' | 'instagram' | 'x' = ident.startsWith('instagram')
			? 'instagram'
			: ident === 'x'
				? 'x'
				: 'threads';
		const cur =
			out[intId] && typeof out[intId] === 'object' && !Array.isArray(out[intId])
				? { ...(out[intId] as Record<string, unknown>) }
				: {};
		const prevB =
			cur[bucket] && typeof cur[bucket] === 'object' && !Array.isArray(cur[bucket])
				? { ...(cur[bucket] as Record<string, unknown>) }
				: bucket === 'threads' || bucket === 'x'
					? { enabled: false, message: "That's a wrap!" }
					: {};
		out[intId] = { ...cur, [bucket]: { ...prevB, replies: serial } };
	}
	return out;
}
