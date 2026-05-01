import type {
	PostingTimeSlotViewModel,
	WorkspaceChannelGroupViewModel
} from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';
import { publicUrlForMediaStorageKey } from '$lib/medias/utils/publicMediaObjectUrl';
import type {
	PostCommentProgrammerModel,
	PostGroupDetailsProgrammerModel,
	PostMediaProgrammerModel,
	PostPreviewProgrammerModel,
	PostRowProgrammerModel,
	PostsRepository
} from '$lib/posts/Post.repository.svelte';

export interface CalendarPostRowViewModel {
	id: string;
	postGroup: string;
	state: string;
	publishDate: string;
	organizationId: string;
	integrationId: string | null;
	content: string;
	intervalInDays?: number | null;
	repeatInterval?: string | null;
	error?: string | null;
}

export interface PostGroupDetailsViewModel {
	postGroup: string;
	organizationId: string;
	isGlobal: boolean;
	repeatInterval: string | null;
	publishDateIso: string;
	status: 'draft' | 'scheduled';
	integrationIds: string[];
	body: string;
	bodiesByIntegrationId: Record<string, string>;
	media: { id: string; path: string; bucket?: 'social_media' }[];
	tagNames: string[];
	postIds?: string[];
}

export type GetPostGroupResultViewModel =
	| { ok: true; group: PostGroupDetailsViewModel }
	| { ok: false; error: string };

/** Public `/p/[postId]` preview (maps API programmer model → UI view model). */
export interface PublicPreviewThreadReplyViewModel {
	id: string;
	message: string;
	delaySeconds: number;
}

/** Public `/p/[postId]` — scheduled thread follow-ups (distinct from composer comments). */
export interface PublicPreviewPostViewModel {
	id: string;
	postGroup: string;
	organizationId: string;
	publishDateIso: string;
	content: string;
	media: { id: string; path: string }[];
	socialPlatformLabel?: string | null;
	integrationId?: string | null;
	providerIdentifier?: string | null;
	channelName?: string | null;
	channelPictureUrl?: string | null;
	threadReplies: PublicPreviewThreadReplyViewModel[];
	threadFinisher: { enabled: boolean; message: string } | null;
}

/**
 * Minimal channel VM for provider-specific mock previews on `/p/[postId]` (no integrations list fetch).
 * Same field shape as `CreateSocialPostChannelViewModel`; kept explicit so public preview stays decoupled from dashboard wiring.
 */
export interface PublicPreviewChannelViewModel {
	id: string;
	internalId: string;
	name: string;
	identifier: string;
	picture: string | null;
	type: string;
	disabled: boolean;
	inBetweenSteps: boolean;
	refreshNeeded: boolean;
	schedulable: boolean;
	unschedulableReason: string | null;
	group: WorkspaceChannelGroupViewModel | null;
	postingTimes: PostingTimeSlotViewModel[];
}

export function toPublicPreviewChannelVm(
	post: PublicPreviewPostViewModel
): PublicPreviewChannelViewModel | null {
	const integrationId = post.integrationId?.trim() ?? '';
	const providerIdentifier = (post.providerIdentifier ?? '').trim().toLowerCase();
	const label = (post.channelName ?? '').trim() || (post.socialPlatformLabel ?? '').trim();
	if (!integrationId && !providerIdentifier && !label) return null;
	const displayName = label || 'Channel';
	const pictureRaw = post.channelPictureUrl?.trim();
	return {
		id: integrationId || 'public-preview',
		internalId: '',
		name: displayName,
		identifier: providerIdentifier || 'generic',
		picture: pictureRaw ? pictureRaw : null,
		type: 'social',
		disabled: false,
		inBetweenSteps: false,
		refreshNeeded: false,
		schedulable: true,
		unschedulableReason: null,
		group: null,
		postingTimes: []
	};
}

/** Public composer comment view model (UI-safe shape). */
export interface PostCommentViewModel {
	id: string;
	postId: string;
	organizationId: string;
	userId: string;
	content: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

function toPostCommentVm(pm: PostCommentProgrammerModel): PostCommentViewModel {
	return { ...pm };
}

function toCalendarPostRowVm(pm: PostRowProgrammerModel): CalendarPostRowViewModel {
	return { ...pm };
}

function toPostGroupDetailsVm(pm: PostGroupDetailsProgrammerModel): PostGroupDetailsViewModel {
	return {
		postGroup: pm.postGroup,
		organizationId: pm.organizationId,
		isGlobal: pm.isGlobal,
		repeatInterval: pm.repeatInterval,
		publishDateIso: pm.publishDateIso,
		status: pm.status,
		integrationIds: pm.integrationIds,
		body: pm.body,
		bodiesByIntegrationId: pm.bodiesByIntegrationId,
		media: pm.media,
		tagNames: pm.tagNames,
		postIds: pm.postIds
	};
}

export class GetScheduledPostsPresenter {
	constructor(private readonly postsRepository: PostsRepository) {}

	public toPostCommentVm(pm: PostCommentProgrammerModel): PostCommentViewModel {
		return toPostCommentVm(pm);
	}

	/** Maps attached post media PM rows to public CDN URLs for previews / thumbnails. */
	public toPostMediaPreviewUrlsVm(items: PostMediaProgrammerModel[]): string[] {
		return items.map((m) => publicUrlForMediaStorageKey(m.path));
	}

	private toPreviewPostVm(previewPostPm: PostPreviewProgrammerModel): PublicPreviewPostViewModel {
		const replies = Array.isArray(previewPostPm.threadReplies) ? previewPostPm.threadReplies : [];
		const previewPostVm: PublicPreviewPostViewModel = {
			id: previewPostPm.id,
			postGroup: previewPostPm.postGroup,
			organizationId: previewPostPm.organizationId,
			publishDateIso: previewPostPm.publishDateIso,
			content: previewPostPm.content,
			media: Array.isArray(previewPostPm.media) ? previewPostPm.media : [],
			socialPlatformLabel: previewPostPm.socialPlatformLabel ?? null,
			integrationId: previewPostPm.integrationId ?? null,
			providerIdentifier: previewPostPm.providerIdentifier ?? null,
			channelName: previewPostPm.channelName ?? null,
			channelPictureUrl: previewPostPm.channelPictureUrl ?? null,
			threadReplies: replies.map((r) => ({
				id: r.id,
				message: r.message,
				delaySeconds: r.delaySeconds
			})),
			threadFinisher: previewPostPm.threadFinisher ?? null
		};
		return previewPostVm;
	}

	/**
	 * ✅ Stateless — fetch public preview PM then map to {@link PublicPreviewPostViewModel}.
	 * Keeps repository access + mapping inside this presenter.
	 */
	public async loadPostPreviewVmById(
		postId: string,
		options?: { fetch?: typeof globalThis.fetch }
	): Promise<PublicPreviewPostViewModel | null> {
		try {
			const pmResult = await this.postsRepository.getPostPreview(postId, options);
			if (!pmResult.ok) return null;
			return this.toPreviewPostVm(pmResult.post);
		} catch {
			return null;
		}
	}

	/** Calendar list — returns empty list on failure. */
	public async loadCalendarPostsVm(params: {
		organizationId: string;
		startIso: string;
		endIso: string;
		integrationIds?: string[] | null;
	}): Promise<CalendarPostRowViewModel[]> {
		try {
			const listPostsPmResult = await this.postsRepository.listPosts(params);
			if (!listPostsPmResult.ok) return [];
			return listPostsPmResult.posts.map(toCalendarPostRowVm);
		} catch {
			return [];
		}
	}

	public async loadPostGroupDetailsVm(postGroup: string): Promise<PostGroupDetailsViewModel | null> {
		try {
			const r = await this.postsRepository.getPostGroup(postGroup);
			if (!r.ok) return null;
			return toPostGroupDetailsVm(r.group);
		} catch {
			return null;
		}
	}

	/** Public comments VM (no auth) — returns empty list on failure. */
	public async loadPublicCommentsVm(
		postId: string,
		options?: { fetch?: typeof globalThis.fetch }
	): Promise<PostCommentViewModel[]> {
		try {
			const r = await this.postsRepository.getPublicPostComments(postId, options);
			if (!r.ok) return [];
			return r.comments.map(toPostCommentVm);
		} catch {
			return [];
		}
	}
}

