import type { PostsConfig } from '$lib/posts/Posts.repository.svelte';

import { httpGateway } from '$lib/core/index';
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
		updatePostGroup: `${base}/group`,
		deletePostGroup: `${base}/group`
	}
};

export const postsRepository = new PostsRepository(httpGateway, postsConfig);

export {
	PostsRepository,
	uploadSocialPostComposerMediaFiles,
	mediaItemsToPreviewUrls
} from '$lib/posts/Posts.repository.svelte';
export type {
	CreatePostProgrammerModel,
	PostRowProgrammerModel,
	PostTagProgrammerModel,
	RepeatIntervalKey,
	PostMediaProgrammerModel
} from '$lib/posts/Posts.repository.svelte';
export type { CreateSocialPostPrepareOpenOptions } from '$lib/posts/CreateSocialPostPresenter.svelte';
export { CreateSocialPostPresenter } from '$lib/posts/CreateSocialPostPresenter.svelte';
export { GetScheduledPostsPresenter } from '$lib/posts/GetScheduledPosts.presenter.svelte';
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
