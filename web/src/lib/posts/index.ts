import type { PostsConfig } from '$lib/posts/Posts.repository.svelte';

import { httpGateway } from '$lib/core/index';
import { GetScheduledPostsPresenter } from '$lib/posts/GetScheduledPosts.presenter.svelte';
import { PostsRepository } from '$lib/posts/Posts.repository.svelte';

const base = '/api/v1/posts';

const postsConfig: PostsConfig = {
	endpoints: {
		findSlot: `${base}/find-slot`,
		tags: `${base}/tags`,
		createTag: `${base}/tags`,
		createPost: `${base}`,
		listPosts: `${base}/list`,
		getPostGroup: `${base}/group`,
		debugExportPostGroup: `${base}/group`,
		getPostPreview: `${base}/preview`,
		getPublicPostComments: (postId: string) => `/api/v1/public/posts/${postId}/comments`,
		createPostComment: (postId: string) => `${base}/${postId}/comments`,
		updatePostGroup: `${base}/group`,
		deletePostGroup: `${base}/group`
	}
};

export const postsRepository = new PostsRepository(httpGateway, postsConfig);

/** Shared read-side presenter for calendar + public preview composition roots. */
export const getScheduledPostsPresenter = new GetScheduledPostsPresenter(postsRepository);

export {
	PostsRepository,
	uploadSocialPostComposerMediaFiles,
	mediaItemsToPreviewUrls
} from '$lib/posts/Posts.repository.svelte';
export type {
	CreatePostProgrammerModel,
	PostCommentProgrammerModel,
	PostRowProgrammerModel,
	PostTagProgrammerModel,
	RepeatIntervalKey,
	PostMediaProgrammerModel
} from '$lib/posts/Posts.repository.svelte';
export type { CreateSocialPostPrepareOpenOptions } from '$lib/posts/CreateSocialPostPresenter.svelte';
export { CreateSocialPostPresenter } from '$lib/posts/CreateSocialPostPresenter.svelte';
export { GetScheduledPostsPresenter } from '$lib/posts/GetScheduledPosts.presenter.svelte';
export type { PublicPreviewPostViewModel } from '$lib/posts/GetScheduledPosts.presenter.svelte';
export type { PostCommentViewModel } from '$lib/posts/GetScheduledPosts.presenter.svelte';
export type {
	CalendarPostRowViewModel,
	GetPostGroupResultViewModel,
	PostGroupDetailsViewModel
} from '$lib/posts/GetScheduledPosts.presenter.svelte';
export type {
	CalendarDisplayViewModel,
	CalendarGranularityViewModel,
	CalendarIntegrationFilterViewModel,
	CalendarLayoutModeViewModel,
	CalendarSchedulerFiltersViewModel,
	ChannelViewModel,
	ScheduledPostsCalendarViewModel
} from '$lib/posts/SchedulerPresenter.svelte';
export { CALENDAR_UNGROUPED_SENTINEL, SchedulerPresenter } from '$lib/posts/SchedulerPresenter.svelte';
export {
	socialProviderIcon,
	socialProviderIconByIdentifier
} from '$lib/posts/constants/socialProviderIcons';
