import { feedbackRepository, getFeedbackPresenter } from '$lib/feedbacks';
import { getUserPresenter } from '$lib/user-management';
import { AdminFeedbackManagerPagePresenter } from '$lib/area-admin/AdminFeedbackManagerPage.presenter.svelte';
import { AdminPermissionManagerPagePresenter } from '$lib/area-admin/AdminPermissionManagerPage.presenter.svelte';
import { AdminRoleManagerPagePresenter } from '$lib/area-admin/AdminRoleManagerPage.presenter.svelte';
import { AdminEmailManagerPagePresenter } from '$lib/area-admin/AdminEmailManagerPage.presenter.svelte';
import { AdminBlogEditorPagePresenter } from '$lib/area-admin/AdminBlogEditorPage.presenter.svelte';
import { AdminBlogPostsManagerPagePresenter } from '$lib/area-admin/AdminBlogPostsManagerPage.presenter.svelte';
import { AdminBlogTopicsManagerPagePresenter } from '$lib/area-admin/AdminBlogTopicsManagerPage.presenter.svelte';
import { AdminBlogActivitiesManagerPagePresenter } from '$lib/area-admin/AdminBlogActivitiesManagerPage.presenter.svelte';
import { AdminBlogCommentsManagerPagePresenter } from '$lib/area-admin/AdminBlogCommentsManagerPage.presenter.svelte';
import { getRolePresenter, rbacRepository } from '$lib/rbac';
import { blogRepository, getBlogPresenter } from '$lib/blogs';
import { emailRepository, getEmailPresenter } from '$lib/email';
import { imageRepository } from '$lib/core/index';
import { configRepository } from '$lib/config/Config.repository.svelte';
import { ModuleConfigRendererPresenter } from '$lib/config/ModuleConfigRenderer.presenter.svelte';
const adminFeedbackManagerPagePresenter = new AdminFeedbackManagerPagePresenter(
	getFeedbackPresenter,
	feedbackRepository
);

/** Edit post: `/blog-manager/posts/[id]` */
const adminBlogEditorPagePresenter = new AdminBlogEditorPagePresenter(blogRepository, imageRepository);
/** New post: `/blog-manager/posts/new` (separate instance so state does not leak from edit). */
const adminBlogNewPostPagePresenter = new AdminBlogEditorPagePresenter(blogRepository, imageRepository);

const adminBlogPostsManagerPagePresenter = new AdminBlogPostsManagerPagePresenter(
	getBlogPresenter,
	imageRepository
);

const adminBlogTopicsManagerPagePresenter = new AdminBlogTopicsManagerPagePresenter(blogRepository);

const adminBlogCommentsManagerPagePresenter = new AdminBlogCommentsManagerPagePresenter(
	getBlogPresenter,
	blogRepository
);

const adminBlogActivitiesManagerPagePresenter = new AdminBlogActivitiesManagerPagePresenter(getBlogPresenter);

const adminPermissionManagerPagePresenter = new AdminPermissionManagerPagePresenter(
	getRolePresenter,
	rbacRepository
);

const adminRoleManagerPagePresenter = new AdminRoleManagerPagePresenter(
	getUserPresenter,
	rbacRepository
);

const adminEmailManagerPagePresenter = new AdminEmailManagerPagePresenter(getEmailPresenter, emailRepository);

const companyInformationFormPresenter = new ModuleConfigRendererPresenter(configRepository, 'company_information');
const blogInformationFormPresenter = new ModuleConfigRendererPresenter(configRepository, 'blog');

export {
	adminFeedbackManagerPagePresenter,
	adminPermissionManagerPagePresenter,
	adminRoleManagerPagePresenter,
	adminEmailManagerPagePresenter,
	adminBlogEditorPagePresenter,
	adminBlogNewPostPagePresenter,
	adminBlogPostsManagerPagePresenter,
	adminBlogTopicsManagerPagePresenter,
	adminBlogCommentsManagerPagePresenter,
	adminBlogActivitiesManagerPagePresenter,
	companyInformationFormPresenter,
	blogInformationFormPresenter
};
export type { FeedbackViewModel } from '$lib/feedbacks';
export type { AppRole, AppPermission } from '$lib/rbac/rbac.types';
export type { ExtendedFullUserViewModel } from '$lib/user-management';
export type { BlogPostViewModel } from '$lib/blogs';
