import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';
import type {
	CrossAccountPlugSettingsBucket,
	CrossAccountPlugState
} from '$lib/posts/utils/create-post';

export type CrossAccountPlugPreviewItem = {
	id: string;
	kind: 'comment' | 'repost';
	actorName: string;
	actorPicture: string | null;
	message: string;
	delayMs: number;
	label: string;
};

type PlugDefinitionRef = {
	identifier: string;
	title: string;
};

function inferPlugKind(plugName: string): 'comment' | 'repost' {
	const key = plugName.toLowerCase();
	if (key.includes('comment') || key.includes('add-comment')) return 'comment';
	return 'repost';
}

/** Build preview rows for enabled cross-account plugs (composer + landing mocks). */
export function buildCrossAccountPlugPreviewItems(
	channels: CreateSocialPostChannelViewModel[],
	plugs: CrossAccountPlugState[] | undefined,
	plugDefs: PlugDefinitionRef[] = []
): CrossAccountPlugPreviewItem[] {
	if (!plugs?.length) return [];

	const items: CrossAccountPlugPreviewItem[] = [];

	for (const plug of plugs) {
		if (!plug.enabled || !plug.integrationIds.length) continue;

		const def = plugDefs.find((entry) => entry.identifier === plug.plugName);
		const label = def?.title ?? 'Cross-account plug';
		const kind = inferPlugKind(plug.plugName);
		const commentText = String(plug.fields?.comment ?? '').trim();

		for (const integrationId of plug.integrationIds) {
			const channel = channels.find((ch) => ch.id === integrationId);
			items.push({
				id: `${plug.plugName}-${integrationId}`,
				kind,
				actorName: channel?.name?.trim() || 'Connected channel',
				actorPicture: channel?.picture ?? null,
				message: kind === 'comment' ? commentText : '',
				delayMs: plug.delayMs ?? 0,
				label
			});
		}
	}

	return items;
}

export type CrossAccountPlugEngagementCounts = {
	commentCount: number;
	repostCount: number;
};

export type ScheduledSocialPreviewEngagement = CrossAccountPlugEngagementCounts & {
	totalCommentCount: number;
};

export function crossAccountSettingsBucketForIdentifier(
	identifier: string | null | undefined
): CrossAccountPlugSettingsBucket | null {
	const id = (identifier ?? '').toLowerCase();
	if (id === 'threads') return 'threads';
	if (id === 'x') return 'x';
	if (id === 'linkedin' || id === 'linkedin-page') return 'linkedin';
	return null;
}

export function buildCrossAccountPlugPreviewFromProviderSettings(input: {
	channelIdentifier: string | null | undefined;
	channels: CreateSocialPostChannelViewModel[];
	providerSettings?: Record<string, unknown>;
	plugDefs?: PlugDefinitionRef[];
}): CrossAccountPlugPreviewItem[] {
	const bucket = crossAccountSettingsBucketForIdentifier(input.channelIdentifier);
	if (!bucket) return [];
	const plugs = crossAccountPlugsFromProviderSettings(input.providerSettings, bucket);
	return buildCrossAccountPlugPreviewItems(input.channels, plugs, input.plugDefs ?? []);
}

export function crossAccountPlugsFromProviderSettings(
	settings: Record<string, unknown> | undefined,
	bucket: CrossAccountPlugSettingsBucket
): CrossAccountPlugState[] {
	if (!settings) return [];
	const bucketSettings = settings[bucket];
	const raw = (bucketSettings as { crossAccountPlugs?: unknown } | undefined)?.crossAccountPlugs;
	return Array.isArray(raw) ? (raw as CrossAccountPlugState[]) : [];
}

export function summarizeCrossAccountPlugEngagement(
	items: CrossAccountPlugPreviewItem[]
): CrossAccountPlugEngagementCounts {
	let commentCount = 0;
	let repostCount = 0;
	for (const item of items) {
		if (item.kind === 'comment') commentCount += 1;
		else repostCount += 1;
	}
	return { commentCount, repostCount };
}

export function summarizeScheduledSocialPreviewEngagement(input: {
	threadReplyCount?: number;
	threadFinisher?: { enabled: boolean; message: string } | null;
	delayedEngagementReply?: { message: string; delaySeconds: number } | null;
	crossAccountPlugs?: CrossAccountPlugPreviewItem[];
}): ScheduledSocialPreviewEngagement {
	const threadReplyCount = input.threadReplyCount ?? 0;
	const finisher =
		input.threadFinisher?.enabled === true && (input.threadFinisher.message ?? '').trim().length > 0
			? 1
			: 0;
	const delayed =
		input.delayedEngagementReply && (input.delayedEngagementReply.message ?? '').trim().length > 0
			? 1
			: 0;
	const plugCounts = summarizeCrossAccountPlugEngagement(input.crossAccountPlugs ?? []);
	const sameAccountComments = threadReplyCount + finisher + delayed;
	return {
		...plugCounts,
		totalCommentCount: sameAccountComments + plugCounts.commentCount
	};
}

export function formatEngagementCountLabel(count: number, singular: string, plural: string): string {
	return `${count} ${count === 1 ? singular : plural}`;
}

/** LinkedIn-style "N comments · M reposts" line from scheduled preview engagement. */
export function formatLinkedInEngagementSummary(
	engagement: Pick<ScheduledSocialPreviewEngagement, 'totalCommentCount' | 'repostCount'>
): string | null {
	const parts: string[] = [];
	if (engagement.totalCommentCount > 0) {
		parts.push(
			formatEngagementCountLabel(engagement.totalCommentCount, 'comment', 'comments')
		);
	}
	if (engagement.repostCount > 0) {
		parts.push(formatEngagementCountLabel(engagement.repostCount, 'repost', 'reposts'));
	}
	return parts.length > 0 ? parts.join(' · ') : null;
}

export function formatCrossAccountPlugDelayLabel(delayMs: number): string {
	const seconds = Math.max(0, Math.floor(delayMs / 1000));
	if (seconds === 0) return 'After publish';
	if (seconds < 60) return `After ${seconds}s`;
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `After ${minutes} min`;
	const hours = Math.floor(minutes / 60);
	return `After ${hours} h`;
}
