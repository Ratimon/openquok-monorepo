import { httpGateway } from '$lib/core/index';
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
