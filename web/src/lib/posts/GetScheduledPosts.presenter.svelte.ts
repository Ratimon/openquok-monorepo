import type {
	PostGroupDetailsProgrammerModel,
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

	async listPosts(params: {
		organizationId: string;
		startIso: string;
		endIso: string;
		integrationIds?: string[] | null;
	}): Promise<{ ok: true; posts: CalendarPostRowViewModel[] } | { ok: false; error: string }> {
		const r = await this.postsRepository.listPosts(params);
		if (!r.ok) return r;
		return { ok: true, posts: r.posts.map(toCalendarPostRowVm) };
	}

	async getPostGroup(postGroup: string): Promise<GetPostGroupResultViewModel> {
		const r = await this.postsRepository.getPostGroup(postGroup);
		if (!r.ok) return r;
		return { ok: true, group: toPostGroupDetailsVm(r.group) };
	}
}

