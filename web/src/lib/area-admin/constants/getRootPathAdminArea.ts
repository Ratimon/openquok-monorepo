/**
 * Root path for admin area (within protected routes).
 * Admin role has feedback.* and users.manage_roles permissions.
 */
export function getRootPathAdminArea(): string {
	return 'admin';
}

/**
 * Segment for admin feedback manager.
 */
export function getRootPathAdminFeedbackManagerSegment(): string {
	return 'feedback-manager';
}

/**
 * Segment for admin role manager.
 */
export function getRootPathAdminRoleManagerSegment(): string {
	return 'role-manager';
}

/**
 * Full path for admin feedback manager.
 */
export function getRootPathAdminFeedbackManager(): string {
	return `${getRootPathAdminArea()}/${getRootPathAdminFeedbackManagerSegment()}`;
}

/**
 * Full path for admin role manager.
 */
export function getRootPathAdminRoleManager(): string {
	return `${getRootPathAdminArea()}/${getRootPathAdminRoleManagerSegment()}`;
}
