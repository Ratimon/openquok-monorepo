import type { RbacConfig } from '$lib/rbac/Rbac.repository.svelte';
import type { AppRole, AppPermission } from '$lib/rbac/rbac.types';
import { RbacRepository } from '$lib/rbac/Rbac.repository.svelte';
import { GetRolePresenter } from '$lib/rbac/GetRole.presenter.svelte';
import { ActionVerificationModalPresenter } from '$lib/core/ActionVerificationModal.presenter.svelte';
import { httpGateway } from '$lib/core/index';

const rbacConfig: RbacConfig = {
	endpoints: {
		getAllRolePermissions: '/api/v1/roles/permissions',
		assignPermissionToRole: '/api/v1/roles/:role/permissions/:permission',
		removePermissionFromRole: '/api/v1/roles/:role/permissions/:permission',
		assignRole: '/api/v1/users/:userId/roles/:role',
		removeRole: '/api/v1/users/:userId/roles/:role'
	}
};

export const rbacRepository = new RbacRepository(httpGateway, rbacConfig);
export const getRolePresenter = new GetRolePresenter(rbacRepository);

const assignPermissionToRoleWrapper = async (data: unknown): Promise<{ success: boolean; message: string }> => {
	const { role, permission } = data as { role: string; permission: string };
	return rbacRepository.assignPermissionToRole(role as AppRole, permission as AppPermission);
};

const removePermissionFromRoleWrapper = async (data: unknown): Promise<{ success: boolean; message: string }> => {
	const { role, permission } = data as { role: string; permission: string };
	return rbacRepository.removePermissionFromRole(role as AppRole, permission as AppPermission);
};

const assignRoleWrapper = async (data: unknown): Promise<{ success: boolean; message: string }> => {
	const { userId, role } = data as { userId: string; role: string };
	return rbacRepository.assignRole(userId, role as AppRole);
};

const removeRoleWrapper = async (data: unknown): Promise<{ success: boolean; message: string }> => {
	const { userId, role } = data as { userId: string; role: string };
	return rbacRepository.removeRole(userId, role as AppRole);
};

export const assignPermissionToRolePresenter = new ActionVerificationModalPresenter(assignPermissionToRoleWrapper);
export const removePermissionFromRolePresenter = new ActionVerificationModalPresenter(removePermissionFromRoleWrapper);
export const assignRolePresenter = new ActionVerificationModalPresenter(assignRoleWrapper);
export const removeRolePresenter = new ActionVerificationModalPresenter(removeRoleWrapper);

export type { AppRole, AppPermission } from '$lib/rbac/rbac.types';
export type { RoleViewModel } from '$lib/rbac/GetRole.presenter.svelte';
