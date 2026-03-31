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
