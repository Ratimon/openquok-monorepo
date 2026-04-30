import { httpGateway } from '$lib/core/index';
import { ActionVerificationModalPresenter } from '$lib/core/ActionVerificationModal.presenter.svelte';
import { BlogRepository } from '$lib/blogs/Blog.repository.svelte';
import { createSortedTopicChoices } from '$lib/blogs/Blog.repository.svelte';
import { GetBlogPresenter } from '$lib/blogs/GetBlog.presenter.svelte';
import { UpsertBlogTopicModalPresenter } from '$lib/blogs/UpsertBlogTopicModal.presenter.svelte';

const blogConfig = {
	endpoints: {
		getPostById: (id: string) => `/api/v1/blog-system/posts/${id}`,
		getAdminPosts: '/api/v1/blog-system/admin/posts',
		getAdminComments: '/api/v1/blog-system/admin/comments',
		getAdminActivities: '/api/v1/blog-system/admin/activities',
		getTopics: '/api/v1/blog-system/topics',
		getActiveTopics: '/api/v1/blog-system/topics/active',
		getPublishedAuthors: '/api/v1/blog-system/authors',
		getPublishedPosts: '/api/v1/blog-system/posts',
		getBlogInformation: '/api/v1/blog-system/information',
		createPost: '/api/v1/blog-system/posts',
		updatePost: (id: string) => `/api/v1/blog-system/posts/${id}`,
		deletePost: (id: string) => `/api/v1/blog-system/posts/${id}`,
		createTopic: '/api/v1/blog-system/topics',
		updateTopic: (id: string) => `/api/v1/blog-system/topics/${id}`,
		deleteTopic: (id: string) => `/api/v1/blog-system/topics/${id}`,
		approveComment: (id: string) => `/api/v1/blog-system/comments/${id}/approve`,
		deleteComment: (id: string) => `/api/v1/blog-system/comments/${id}`,
		getPostComments: (postId: string) => `/api/v1/blog-system/posts/${postId}/comments`,
		trackActivity: (postId: string) => `/api/v1/blog-system/posts/${postId}/activity`,
		createComment: '/api/v1/blog-system/comments'
	}
};

const blogRepository = new BlogRepository(httpGateway, blogConfig);
const getBlogPresenter = new GetBlogPresenter(blogRepository);

const upsertBlogTopicModalPresenter = new UpsertBlogTopicModalPresenter(blogRepository);

const deleteBlogTopicVerificationPresenter = new ActionVerificationModalPresenter(
	async (data: unknown) => {
		const d = data as { topicId: string; topicName: string };
		return blogRepository.deleteBlogTopic(d.topicId);
	}
);

const deleteBlogPostVerificationPresenter = new ActionVerificationModalPresenter(
	async (data: unknown) => {
		const d = data as { postId: string; postTitle: string };
		return blogRepository.deleteBlogPost(d.postId);
	}
);

const deleteBlogCommentVerificationPresenter = new ActionVerificationModalPresenter(
	async (data: unknown) => {
		const d = data as { commentId: string };
		return blogRepository.deleteBlogComment(d.commentId);
	}
);

export {
	blogRepository,
	createSortedTopicChoices,
	deleteBlogCommentVerificationPresenter,
	deleteBlogPostVerificationPresenter,
	deleteBlogTopicVerificationPresenter,
	getBlogPresenter,
	upsertBlogTopicModalPresenter
};
export { blogPublicTopicIdParamSchema } from '$lib/blogs/blog.types';
export type {
	AdminBlogActivityVm,
	AdminBlogCommentVm,
	BlogPostFormSchemaType,
	TopicChoice
} from '$lib/blogs/blog.types';
export type {
	AdminBlogActivityProgrammerModel,
	AdminBlogCommentProgrammerModel,
	BlogConfig,
	BlogUpsertProgrammerModel,
	BlogPostCommentProgrammerModel,
	BlogPostProgrammerModel,
	BlogTopicProgrammerModel,
	ActiveBlogTopicProgrammerModel,
	PublishedBlogAuthorProgrammerModel
} from '$lib/blogs/Blog.repository.svelte';
export type {
	BlogAuthorPublicViewModel,
	BlogPostViewModel,
	BlogPostPublicViewModel,
	BlogTopicPublicViewModel,
	BlogTopicOverviewPublicViewModel,
	PublicBlogOverviewVm
} from '$lib/blogs/GetBlog.presenter.svelte';
export { BLOG_IMAGES_BUCKET } from '$lib/blogs/constants/config';
export {
	buildBlogInlineImageSrc,
	buildBlogTopicViewModelFromUpsert,
	extractBlogImageStoragePathFromImageSrc,
	normalizeBlogInlineImagesInHtml
} from '$lib/blogs/utils';
