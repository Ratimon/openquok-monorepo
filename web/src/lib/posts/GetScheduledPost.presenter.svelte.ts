import type {
	PostGroupDetailsProgrammerModel,
	PostPreviewProgrammerModel,
	PostRowProgrammerModel,
	PostsRepository
} from '$lib/posts/Post.repository.svelte';
import type { PostCommentProgrammerModel } from '$lib/posts/Post.repository.svelte';

export interface CalendarPostRowViewModel {
	id: string;
	postGroup: string;
	state: string;
	publishDate: string;
	organizationId: string;
	integrationId: string | null;
	content: string;
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
export interface PublicPreviewPostViewModel {
	id: string;
	postGroup: string;
	organizationId: string;
	publishDateIso: string;
	content: string;
	media: { id: string; path: string }[];
	socialPlatformLabel?: string | null;
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

	private toPreviewPostVm(previewPostPm: PostPreviewProgrammerModel): PublicPreviewPostViewModel {
		const previewPostVm: PublicPreviewPostViewModel = {
			id: previewPostPm.id,
			postGroup: previewPostPm.postGroup,
			organizationId: previewPostPm.organizationId,
			publishDateIso: previewPostPm.publishDateIso,
			content: previewPostPm.content,
			media: Array.isArray(previewPostPm.media) ? previewPostPm.media : [],
			socialPlatformLabel: previewPostPm.socialPlatformLabel ?? null
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

