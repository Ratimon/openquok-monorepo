/**
 * Root path for secret super-admin area (within protected routes).
 */
export function getRootPathSecretAdminArea(): string {
	return 'secret-admin';
}

/**
 * Segment for secret-admin feedback manager.
 */
export function getRootPathFeedbackManager(): string {
	return 'feedback-manager';
}

/**
 * Segment for secret-admin role manager.
 */
export function getRootPathRoleManager(): string {
	return 'role-manager';
}

/**
 * Segment for secret-admin permission manager.
 */
export function getRootPathPermissionManager(): string {
	return 'permission-manager';
}

/**
 * Segment for secret-admin email manager (Resend inbox / send).
 */
export function getRootPathEmailManager(): string {
	return 'email-manager';
}

/**
 * Segment for Bull Board (BullMQ) queue dashboard (proxied in the web app with Bearer token).
 */
export function getRootPathBullBoard(): string {
	return 'bull-board';
}

/**
 * Full path for secret-admin feedback manager.
 */
export function getRootPathSecretAdminFeedbackManager(): string {
	return `${getRootPathSecretAdminArea()}/${getRootPathFeedbackManager()}`;
}

/**
 * Full path for secret-admin role manager.
 */
export function getRootPathSecretAdminRoleManager(): string {
	return `${getRootPathSecretAdminArea()}/${getRootPathRoleManager()}`;
}

/**
 * Full path for secret-admin permission manager.
 */
export function getRootPathSecretAdminPermissionManager(): string {
	return `${getRootPathSecretAdminArea()}/${getRootPathPermissionManager()}`;
}

/**
 * Full path for secret-admin email manager.
 */
export function getRootPathSecretAdminEmailManager(): string {
	return `${getRootPathSecretAdminArea()}/${getRootPathEmailManager()}`;
}

/**
 * Full path for secret-admin Bull Board (queues).
 */
export function getRootPathSecretAdminBullBoard(): string {
	return `${getRootPathSecretAdminArea()}/${getRootPathBullBoard()}`;
}

/**
 * Segment for secret-admin blog manager.
 */
export function getRootPathBlogManagerSegment(): string {
	return 'blog-manager';
}

/**
 * Segment for secret-admin blog manager posts.
 */
export function getRootPathBlogManagerPostsSegment(): string {
	return 'posts';
}

/**
 * Segment for secret-admin blog manager topics.
 */
export function getRootPathBlogManagerTopicsSegment(): string {
	return 'topics';
}

/**
 * Segment for secret-admin blog manager comments.
 */
export function getRootPathBlogManagerCommentsSegment(): string {
	return 'comments';
}

/**
 * Segment for secret-admin blog manager activities.
 */
export function getRootPathBlogManagerActivitiesSegment(): string {
	return 'activities';
}

/**
 * Segment for secret-admin blog manager new post page.
 */
export function getRootPathBlogManagerNewPostSegment(): string {
	return 'new';
}

/**
 * Full path for secret-admin blog editor.
 *
 * Note: the old `secret-admin/blog-editor` route was moved under `blog-manager`.
 */
// export function getRootPathSecretAdminBlogEditor(): string {
// 	return getRootPathSecretAdminBlogManager();
// }

/**
 * Full path for secret-admin blog manager (list).
 */
export function getRootPathSecretAdminBlogManager(): string {
	return `${getRootPathSecretAdminArea()}/${getRootPathBlogManagerSegment()}`;
}

/**
 * Full path for secret-admin blog manager posts (base).
 */
export function getRootPathSecretAdminBlogManagerPosts(): string {
	return `${getRootPathSecretAdminBlogManager()}/${getRootPathBlogManagerPostsSegment()}`;
}

/**
 * Full path for secret-admin blog manager new post page.
 */
export function getRootPathSecretAdminBlogManagerNewPost(): string {
	return `${getRootPathSecretAdminBlogManagerPosts()}/${getRootPathBlogManagerNewPostSegment()}`;
}

/**
 * Full path for secret-admin blog manager topics.
 */
export function getRootPathSecretAdminBlogManagerTopics(): string {
	return `${getRootPathSecretAdminBlogManager()}/${getRootPathBlogManagerTopicsSegment()}`;
}

/**
 * Full path for secret-admin blog manager comments.
 */
export function getRootPathSecretAdminBlogManagerComments(): string {
	return `${getRootPathSecretAdminBlogManager()}/${getRootPathBlogManagerCommentsSegment()}`;
}

/**
 * Full path for secret-admin blog manager activities.
 */
export function getRootPathSecretAdminBlogManagerActivities(): string {
	return `${getRootPathSecretAdminBlogManager()}/${getRootPathBlogManagerActivitiesSegment()}`;
}

/**
 * Full path for secret-admin blog manager post editor.
 */
export function getRootPathSecretAdminBlogManagerPostEditor(postId: string): string {
	return `${getRootPathSecretAdminBlogManagerPosts()}/${postId}`;
}

/**
 * Segment for secret-admin config manager.
 */
export function getRootPathConfigManager(): string {
	return 'config-manager';
}

/**
 * Full path for secret-admin config manager.
 */
export function getRootPathSecretAdminConfigManager(): string {
	return `${getRootPathSecretAdminArea()}/${getRootPathConfigManager()}`;
}

/**
 * Segment for config-manager company information.
 */
export function getRootPathConfigManagerCompanyInformation(): string {
	return 'company-information';
}

/**
 * Full path for config-manager company information.
 */
export function getRootPathSecretAdminConfigManagerCompanyInformation(): string {
	return `${getRootPathSecretAdminConfigManager()}/${getRootPathConfigManagerCompanyInformation()}`;
}

/**
 * Segment for config-manager blog information.
 */
export function getRootPathConfigManagerBlogInformation(): string {
	return 'blog-information';
}

/**
 * Full path for config-manager blog information.
 */
export function getRootPathSecretAdminConfigManagerBlogInformation(): string {
	return `${getRootPathSecretAdminConfigManager()}/${getRootPathConfigManagerBlogInformation()}`;
}

/**
 * Segment for config-manager marketing information.
 */
export function getRootPathConfigManagerMarketingInformation(): string {
	return 'marketing-information';
}

/**
 * Full path for config-manager marketing information.
 */
export function getRootPathSecretAdminConfigManagerMarketingInformation(): string {
	return `${getRootPathSecretAdminConfigManager()}/${getRootPathConfigManagerMarketingInformation()}`;
}

/**
 * Segment for config-manager landing page.
 */
export function getRootPathConfigManagerLandingPage(): string {
	return 'landing-page';
}

/**
 * Full path for config-manager landing page.
 */
export function getRootPathSecretAdminConfigManagerLandingPage(): string {
	return `${getRootPathSecretAdminConfigManager()}/${getRootPathConfigManagerLandingPage()}`;
}

/**
 * Segment for config-manager public FAQ section copy.
 */
export function getRootPathConfigManagerPublicFaq(): string {
	return 'public-faq';
}

/**
 * Full path for config-manager public FAQ section copy.
 */
export function getRootPathSecretAdminConfigManagerPublicFaq(): string {
	return `${getRootPathSecretAdminConfigManager()}/${getRootPathConfigManagerPublicFaq()}`;
}

/**
 * Segment for secret-admin listing manager.
 */
export function getRootPathListingManagerSegment(): string {
	return 'listing-manager';
}

/**
 * Segment for secret-admin listing manager building blocks.
 */
export function getRootPathListingManagerBuildingBlocksSegment(): string {
	return 'building-blocks';
}

/**
 * Segment for secret-admin listing manager playbooks.
 */
export function getRootPathListingManagerPlaybooksSegment(): string {
	return 'playbooks';
}

/**
 * Segment for secret-admin listing manager categories.
 */
export function getRootPathListingManagerCategoriesSegment(): string {
	return 'categories';
}

/**
 * Segment for secret-admin listing manager tags.
 */
export function getRootPathListingManagerTagsSegment(): string {
	return 'tags';
}

/**
 * Segment for secret-admin listing manager comments.
 */
export function getRootPathListingManagerCommentsSegment(): string {
	return 'comments';
}

/**
 * Segment for secret-admin listing manager activities.
 */
export function getRootPathListingManagerActivitiesSegment(): string {
	return 'activities';
}

/**
 * Segment for secret-admin listing manager new listing page.
 */
export function getRootPathListingManagerNewSegment(): string {
	return 'new';
}

/**
 * Full path for secret-admin listing manager (dashboard).
 */
export function getRootPathSecretAdminListingManager(): string {
	return `${getRootPathSecretAdminArea()}/${getRootPathListingManagerSegment()}`;
}

/**
 * Full path for secret-admin listing manager building blocks list.
 */
export function getRootPathSecretAdminListingManagerBuildingBlocks(): string {
	return `${getRootPathSecretAdminListingManager()}/${getRootPathListingManagerBuildingBlocksSegment()}`;
}

/**
 * Full path for secret-admin listing manager new building block page.
 */
export function getRootPathSecretAdminListingManagerNewBuildingBlock(): string {
	return `${getRootPathSecretAdminListingManagerBuildingBlocks()}/${getRootPathListingManagerNewSegment()}`;
}

/**
 * Full path for secret-admin listing manager building block editor.
 */
export function getRootPathSecretAdminListingManagerBuildingBlockEditor(id: string): string {
	return `${getRootPathSecretAdminListingManagerBuildingBlocks()}/${id}`;
}

/**
 * Full path for secret-admin listing manager playbooks list.
 */
export function getRootPathSecretAdminListingManagerPlaybooks(): string {
	return `${getRootPathSecretAdminListingManager()}/${getRootPathListingManagerPlaybooksSegment()}`;
}

/**
 * Full path for secret-admin listing manager new playbook page.
 */
export function getRootPathSecretAdminListingManagerNewPlaybook(): string {
	return `${getRootPathSecretAdminListingManagerPlaybooks()}/${getRootPathListingManagerNewSegment()}`;
}

/**
 * Full path for secret-admin listing manager playbook editor.
 */
export function getRootPathSecretAdminListingManagerPlaybookEditor(id: string): string {
	return `${getRootPathSecretAdminListingManagerPlaybooks()}/${id}`;
}

/**
 * Full path for secret-admin listing manager categories.
 */
export function getRootPathSecretAdminListingManagerCategories(): string {
	return `${getRootPathSecretAdminListingManager()}/${getRootPathListingManagerCategoriesSegment()}`;
}

/**
 * Full path for secret-admin listing manager tags.
 */
export function getRootPathSecretAdminListingManagerTags(): string {
	return `${getRootPathSecretAdminListingManager()}/${getRootPathListingManagerTagsSegment()}`;
}

/**
 * Full path for secret-admin listing manager comments.
 */
export function getRootPathSecretAdminListingManagerComments(): string {
	return `${getRootPathSecretAdminListingManager()}/${getRootPathListingManagerCommentsSegment()}`;
}

/**
 * Full path for secret-admin listing manager activities.
 */
export function getRootPathSecretAdminListingManagerActivities(): string {
	return `${getRootPathSecretAdminListingManager()}/${getRootPathListingManagerActivitiesSegment()}`;
}
