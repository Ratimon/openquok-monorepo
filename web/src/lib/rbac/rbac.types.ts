/**
 * App-level RBAC types (aligned with backend data/types/rbacTypes).
 */

export type AppPermission =
	| 'feedback.view'
	| 'feedback.edit'
	| 'feedback.delete'
	| 'users.manage_roles';

export type AppRole = 'editor' | 'admin';

export const VALID_PERMISSIONS: AppPermission[] = [
	'feedback.view',
	'feedback.edit',
	'feedback.delete',
	'users.manage_roles'
];

export const VALID_ROLES: AppRole[] = ['editor', 'admin'];
