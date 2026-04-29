import type {
	PostGroupDetailsProgrammerModel,
	PostPreviewProgrammerModel,
	PostRowProgrammerModel,
	PostsRepository
} from '$lib/posts/Posts.repository.svelte';

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

	mapPreviewPostPmToVm(previewPostPm: PostPreviewProgrammerModel): PublicPreviewPostViewModel {
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

	// async fetchPostPreviewPm(
	// 	postId: string,
	// 	options?: { fetch?: typeof globalThis.fetch }
	// ): Promise<{ ok: true; post: PostPreviewProgrammerModel } | { ok: false; error: string }> {
	// 	return this.postsRepository.getPostPreview(postId, options);
	// }

	async listPosts(params: {
		organizationId: string;
		startIso: string;
		endIso: string;
		integrationIds?: string[] | null;
	}): Promise<{ ok: true; posts: CalendarPostRowViewModel[] } | { ok: false; error: string }> {
		const listPostsPmResult = await this.postsRepository.listPosts(params);
		if (!listPostsPmResult.ok) return listPostsPmResult;
		const postRowsPm = listPostsPmResult.posts;
		return { ok: true, posts: postRowsPm.map(toCalendarPostRowVm) };
	}

	async getPostGroup(postGroup: string): Promise<GetPostGroupResultViewModel> {
		const getPostGroupPmResult = await this.postsRepository.getPostGroup(postGroup);
		if (!getPostGroupPmResult.ok) return getPostGroupPmResult;
		const postGroupDetailsPm = getPostGroupPmResult.group;
		const postGroupDetailsVm = toPostGroupDetailsVm(postGroupDetailsPm);
		return { ok: true, group: postGroupDetailsVm };
	}
}

