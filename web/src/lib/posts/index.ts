import type { PostsConfig } from '$lib/posts/Post.repository.svelte';

import { httpGateway } from '$lib/core/index';
import { GetScheduledPostsPresenter } from '$lib/posts/GetScheduledPost.presenter.svelte';
import { PostsRepository } from '$lib/posts/Post.repository.svelte';

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

export { PostsRepository, uploadSocialPostComposerMediaFiles } from '$lib/posts/Post.repository.svelte';
export type {
	CreatePostProgrammerModel,
	PostCommentProgrammerModel,
	PostRowProgrammerModel,
	PostTagProgrammerModel,
	RepeatIntervalKey,
	PostMediaProgrammerModel
} from '$lib/posts/Post.repository.svelte';
export type { CreateSocialPostPrepareOpenOptions } from '$lib/posts/CreateSocialPostPresenter.svelte';
export { CreateSocialPostPresenter } from '$lib/posts/CreateSocialPostPresenter.svelte';
export { default as Delay } from '$lib/ui/components/posts/thread/Delay.svelte';
export { GetScheduledPostsPresenter, toPublicPreviewChannelVm } from '$lib/posts/GetScheduledPost.presenter.svelte';
export type {
	PublicPreviewChannelViewModel,
	PublicPreviewPostViewModel,
	PublicPreviewThreadReplyViewModel
} from '$lib/posts/GetScheduledPost.presenter.svelte';
export type { PostCommentViewModel } from '$lib/posts/GetScheduledPost.presenter.svelte';
export type {
	CalendarPostRowViewModel,
	GetPostGroupResultViewModel,
	PostGroupDetailsViewModel
} from '$lib/posts/GetScheduledPost.presenter.svelte';
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
export { socialProviderIcon, socialProviderIconByIdentifier } from '$data/social-providers';
