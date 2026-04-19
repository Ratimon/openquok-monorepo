import { composerMediaModalPresenter } from '$lib/area-protected';
import { httpGateway } from '$lib/core/index';
import { CreateSocialPostPresenter } from '$lib/posts/CreateSocialPostPresenter.svelte';
import { PostsRepository, type PostsConfig } from '$lib/posts/Posts.repository.svelte';

const base = '/api/v1/posts';

const postsConfig: PostsConfig = {
	endpoints: {
		findSlot: `${base}/find-slot`,
		tags: `${base}/tags`,
		createTag: `${base}/tags`,
		createPost: `${base}`
	}
};

export const postsRepository = new PostsRepository(httpGateway, postsConfig);

/** Account dashboard + per-channel “Create post” entry share this composer instance (see {@link CreateSocialPostPresenter.prepareOpen}). */
export const createSocialPostPresenter = new CreateSocialPostPresenter(
	postsRepository,
	composerMediaModalPresenter
);

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
