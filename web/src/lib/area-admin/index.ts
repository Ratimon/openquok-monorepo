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
import { AdminListingEditorPagePresenter } from '$lib/area-admin/AdminListingEditorPage.presenter.svelte';
import { AdminListingExtensionsManagerPagePresenter } from '$lib/area-admin/AdminListingExtensionsManagerPage.presenter.svelte';
import { AdminListingStacksManagerPagePresenter } from '$lib/area-admin/AdminListingStacksManagerPage.presenter.svelte';
import { AdminListingCategoriesManagerPagePresenter } from '$lib/area-admin/AdminListingCategoriesManagerPage.presenter.svelte';
import { AdminListingTagsManagerPagePresenter } from '$lib/area-admin/AdminListingTagsManagerPage.presenter.svelte';
import { AdminListingCommentsManagerPagePresenter } from '$lib/area-admin/AdminListingCommentsManagerPage.presenter.svelte';
import { AdminListingActivitiesManagerPagePresenter } from '$lib/area-admin/AdminListingActivitiesManagerPage.presenter.svelte';
import { getRolePresenter, rbacRepository } from '$lib/rbac';
import { blogRepository, getBlogPresenter } from '$lib/blogs';
import { listingRepository, getListingPresenter } from '$lib/listings';
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

/** Edit playbook: `/listing-manager/playbooks/[id]` */
const adminListingStackEditorPagePresenter = new AdminListingEditorPagePresenter(listingRepository);
/** New playbook: `/listing-manager/playbooks/new` */
const adminListingNewStackPagePresenter = new AdminListingEditorPagePresenter(listingRepository);
/** Edit building block: `/listing-manager/building-blocks/[id]` */
const adminListingExtensionEditorPagePresenter = new AdminListingEditorPagePresenter(listingRepository);
/** New building block: `/listing-manager/building-blocks/new` */
const adminListingNewExtensionPagePresenter = new AdminListingEditorPagePresenter(listingRepository);

const adminListingExtensionsManagerPagePresenter = new AdminListingExtensionsManagerPagePresenter(
	getListingPresenter
);

const adminListingStacksManagerPagePresenter = new AdminListingStacksManagerPagePresenter(getListingPresenter);

const adminListingCategoriesManagerPagePresenter = new AdminListingCategoriesManagerPagePresenter(
	listingRepository
);

const adminListingTagsManagerPagePresenter = new AdminListingTagsManagerPagePresenter(listingRepository);

const adminListingCommentsManagerPagePresenter = new AdminListingCommentsManagerPagePresenter(
	getListingPresenter,
	listingRepository
);

const adminListingActivitiesManagerPagePresenter = new AdminListingActivitiesManagerPagePresenter(
	getListingPresenter
);

const adminPermissionManagerPagePresenter = new AdminPermissionManagerPagePresenter(
	getRolePresenter,
	rbacRepository
);

const adminRoleManagerPagePresenter = new AdminRoleManagerPagePresenter(
	getUserPresenter,
	rbacRepository
);

const adminEmailManagerPagePresenter = new AdminEmailManagerPagePresenter(getEmailPresenter, emailRepository);

const companyInformationFormPresenter = new ModuleConfigRendererPresenter(
	configRepository,
	'company_information'
);
const marketingInformationFormPresenter = new ModuleConfigRendererPresenter(
	configRepository,
	'marketing_information'
);
const landingPageFormPresenter = new ModuleConfigRendererPresenter(configRepository, 'landing_page');
const publicFaqFormPresenter = new ModuleConfigRendererPresenter(configRepository, 'public_faq');
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
	adminListingExtensionEditorPagePresenter,
	adminListingNewExtensionPagePresenter,
	adminListingStackEditorPagePresenter,
	adminListingNewStackPagePresenter,
	adminListingExtensionsManagerPagePresenter,
	adminListingStacksManagerPagePresenter,
	adminListingCategoriesManagerPagePresenter,
	adminListingTagsManagerPagePresenter,
	adminListingCommentsManagerPagePresenter,
	adminListingActivitiesManagerPagePresenter,
	companyInformationFormPresenter,
	marketingInformationFormPresenter,
	landingPageFormPresenter,
	publicFaqFormPresenter,
	blogInformationFormPresenter
};
export type { FeedbackViewModel } from '$lib/feedbacks';
export type { AppRole, AppPermission } from '$lib/rbac/rbac.types';
export type { ExtendedFullUserViewModel } from '$lib/user-management';
export type { BlogPostViewModel } from '$lib/blogs';
export type { ListingViewModel } from '$lib/listings';
