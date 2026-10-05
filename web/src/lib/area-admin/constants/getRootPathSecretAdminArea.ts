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
 * Segment for secret-admin catalog manager.
 */
export function getRootPathCatalogManagerSegment(): string {
	return 'catalog-manager';
}

/**
 * Segment for secret-admin catalog manager building blocks.
 */
export function getRootPathCatalogManagerBuildingBlocksSegment(): string {
	return 'building-blocks';
}

/**
 * Segment for secret-admin catalog manager playbooks.
 */
export function getRootPathCatalogManagerPlaybooksSegment(): string {
	return 'playbooks';
}

/**
 * Segment for secret-admin catalog manager categories.
 */
export function getRootPathCatalogManagerCategoriesSegment(): string {
	return 'categories';
}

/**
 * Segment for secret-admin catalog manager tags.
 */
export function getRootPathCatalogManagerTagsSegment(): string {
	return 'tags';
}

/**
 * Segment for secret-admin catalog manager comments.
 */
export function getRootPathCatalogManagerCommentsSegment(): string {
	return 'comments';
}

/**
 * Segment for secret-admin catalog manager activities.
 */
export function getRootPathCatalogManagerActivitiesSegment(): string {
	return 'activities';
}

/**
 * Segment for secret-admin catalog manager new listing page.
 */
export function getRootPathCatalogManagerNewSegment(): string {
	return 'new';
}

/**
 * Full path for secret-admin catalog manager (dashboard).
 */
export function getRootPathSecretAdminCatalogManager(): string {
	return `${getRootPathSecretAdminArea()}/${getRootPathCatalogManagerSegment()}`;
}

/**
 * Full path for secret-admin catalog manager building blocks list.
 */
export function getRootPathSecretAdminCatalogManagerBuildingBlocks(): string {
	return `${getRootPathSecretAdminCatalogManager()}/${getRootPathCatalogManagerBuildingBlocksSegment()}`;
}

/**
 * Full path for secret-admin catalog manager new building block page.
 */
export function getRootPathSecretAdminCatalogManagerNewBuildingBlock(): string {
	return `${getRootPathSecretAdminCatalogManagerBuildingBlocks()}/${getRootPathCatalogManagerNewSegment()}`;
}

/**
 * Full path for secret-admin catalog manager building block editor.
 */
export function getRootPathSecretAdminCatalogManagerBuildingBlockEditor(id: string): string {
	return `${getRootPathSecretAdminCatalogManagerBuildingBlocks()}/${id}`;
}

/**
 * Full path for secret-admin catalog manager playbooks list.
 */
export function getRootPathSecretAdminCatalogManagerPlaybooks(): string {
	return `${getRootPathSecretAdminCatalogManager()}/${getRootPathCatalogManagerPlaybooksSegment()}`;
}

/**
 * Full path for secret-admin catalog manager new playbook page.
 */
export function getRootPathSecretAdminCatalogManagerNewPlaybook(): string {
	return `${getRootPathSecretAdminCatalogManagerPlaybooks()}/${getRootPathCatalogManagerNewSegment()}`;
}

/**
 * Full path for secret-admin catalog manager playbook editor.
 */
export function getRootPathSecretAdminCatalogManagerPlaybookEditor(id: string): string {
	return `${getRootPathSecretAdminCatalogManagerPlaybooks()}/${id}`;
}

/**
 * Full path for secret-admin catalog manager categories.
 */
export function getRootPathSecretAdminCatalogManagerCategories(): string {
	return `${getRootPathSecretAdminCatalogManager()}/${getRootPathCatalogManagerCategoriesSegment()}`;
}

/**
 * Full path for secret-admin catalog manager tags.
 */
export function getRootPathSecretAdminCatalogManagerTags(): string {
	return `${getRootPathSecretAdminCatalogManager()}/${getRootPathCatalogManagerTagsSegment()}`;
}

/**
 * Full path for secret-admin catalog manager comments.
 */
export function getRootPathSecretAdminCatalogManagerComments(): string {
	return `${getRootPathSecretAdminCatalogManager()}/${getRootPathCatalogManagerCommentsSegment()}`;
}

/**
 * Full path for secret-admin catalog manager activities.
 */
export function getRootPathSecretAdminCatalogManagerActivities(): string {
	return `${getRootPathSecretAdminCatalogManager()}/${getRootPathCatalogManagerActivitiesSegment()}`;
}

/**
 * Segment for secret-admin link directory manager.
 */
export function getRootPathLinkDirectoryManagerSegment(): string {
	return 'link-directory-manager';
}

export function getRootPathLinkDirectoryManagerSitesSegment(): string {
	return 'sites';
}

export function getRootPathLinkDirectoryManagerCategoriesSegment(): string {
	return 'categories';
}

export function getRootPathLinkDirectoryManagerTagsSegment(): string {
	return 'tags';
}

export function getRootPathLinkDirectoryManagerSubmissionsSegment(): string {
	return 'submissions';
}

export function getRootPathLinkDirectoryManagerNewSegment(): string {
	return 'new';
}

export function getRootPathSecretAdminLinkDirectoryManager(): string {
	return `${getRootPathSecretAdminArea()}/${getRootPathLinkDirectoryManagerSegment()}`;
}

export function getRootPathSecretAdminLinkDirectoryManagerSites(): string {
	return `${getRootPathSecretAdminLinkDirectoryManager()}/${getRootPathLinkDirectoryManagerSitesSegment()}`;
}

export function getRootPathSecretAdminLinkDirectoryManagerNewSite(): string {
	return `${getRootPathSecretAdminLinkDirectoryManagerSites()}/${getRootPathLinkDirectoryManagerNewSegment()}`;
}

export function getRootPathSecretAdminLinkDirectoryManagerSiteEditor(siteId: string): string {
	return `${getRootPathSecretAdminLinkDirectoryManagerSites()}/${siteId}`;
}

export function getRootPathSecretAdminLinkDirectoryManagerCategories(): string {
	return `${getRootPathSecretAdminLinkDirectoryManager()}/${getRootPathLinkDirectoryManagerCategoriesSegment()}`;
}

export function getRootPathSecretAdminLinkDirectoryManagerTags(): string {
	return `${getRootPathSecretAdminLinkDirectoryManager()}/${getRootPathLinkDirectoryManagerTagsSegment()}`;
}

export function getRootPathSecretAdminLinkDirectoryManagerSubmissions(): string {
	return `${getRootPathSecretAdminLinkDirectoryManager()}/${getRootPathLinkDirectoryManagerSubmissionsSegment()}`;
}
