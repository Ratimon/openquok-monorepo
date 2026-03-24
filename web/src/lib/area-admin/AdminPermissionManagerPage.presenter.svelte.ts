import type { GetRolePresenter, RoleViewModel } from '$lib/rbac/GetRole.presenter.svelte';
import type { RbacRepository } from '$lib/rbac/Rbac.repository.svelte';
import { VALID_PERMISSIONS, type AppPermission, type AppRole } from '$lib/rbac/rbac.types';

export class AdminPermissionManagerPagePresenter {
	public allAvailablePermissions: AppPermission[] = $state([...VALID_PERMISSIONS]);
	public allRolesToManageVm: RoleViewModel[] = $state([]);
	public showToastMessage = $state(false);
	public toastMessage = $state('');

	constructor(
		private readonly getRolePresenter: GetRolePresenter,
		private readonly rbacRepository: RbacRepository
	) {}

	async loadRolesWithPermissions(): Promise<RoleViewModel[]> {
		const rolesVm = await this.getRolePresenter.loadRolesWithPermissions();
		this.allRolesToManageVm = rolesVm;
		return this.allRolesToManageVm;
	}

	/** Load roles with permissions (e.g. on page mount). */
	async load(): Promise<void> {
		await this.loadRolesWithPermissions();
	}

	/** Update VM only after permission was assigned (e.g. from modal success). No API call, no toast. */
	applyRolePermissionAdd(role: AppRole, permission: AppPermission): void {
		this._applyRolePermissionAdd(role, permission);
	}

	/** Update VM only after permission was removed (e.g. from modal success). No API call, no toast. */
	applyRolePermissionRemove(role: AppRole, permission: AppPermission): void {
		this._applyRolePermissionRemove(role, permission);
	}

	/** Assign permission to role: call repository, update VM only on success. */
	async assignPermissionToRole(role: AppRole, permission: AppPermission): Promise<void> {
		const resultPm = await this.rbacRepository.assignPermissionToRole(role, permission);
		if (resultPm.success) {
			this._applyRolePermissionAdd(role, permission);
			this.showToastMessage = true;
			this.toastMessage = resultPm.message ?? 'Permission assigned.';
		} else {
			this.showToastMessage = true;
			this.toastMessage = resultPm.message ?? 'Failed to assign permission.';
		}
	}

	/** Remove permission from role: call repository, update VM only on success. */
	async removePermissionFromRole(role: AppRole, permission: AppPermission): Promise<void> {
		const resultPm = await this.rbacRepository.removePermissionFromRole(role, permission);
		if (resultPm.success) {
			this._applyRolePermissionRemove(role, permission);
			this.showToastMessage = true;
			this.toastMessage = resultPm.message ?? 'Permission removed.';
		} else {
			this.showToastMessage = true;
			this.toastMessage = resultPm.message ?? 'Failed to remove permission.';
		}
	}

	private _applyRolePermissionAdd(role: AppRole, permission: AppPermission): void {
		const existingIndex = this.allRolesToManageVm.findIndex((r) => r.role === role);
		if (existingIndex >= 0) {
			const roleVm = this.allRolesToManageVm[existingIndex];
			if (!roleVm.permissions.includes(permission)) {
				const updatedRoleVm: RoleViewModel = {
					...roleVm,
					permissions: [...roleVm.permissions, permission].sort()
				};
				this.allRolesToManageVm = [
					...this.allRolesToManageVm.slice(0, existingIndex),
					updatedRoleVm,
					...this.allRolesToManageVm.slice(existingIndex + 1)
				];
			}
		}
	}

	private _applyRolePermissionRemove(role: AppRole, permission: AppPermission): void {
		const existingIndex = this.allRolesToManageVm.findIndex((r) => r.role === role);
		if (existingIndex >= 0) {
			const roleVm = this.allRolesToManageVm[existingIndex];
			const updatedPermissions = roleVm.permissions.filter((p) => p !== permission);
			const updatedRoleVm: RoleViewModel = {
				...roleVm,
				permissions: updatedPermissions
			};
			this.allRolesToManageVm = [
				...this.allRolesToManageVm.slice(0, existingIndex),
				updatedRoleVm,
				...this.allRolesToManageVm.slice(existingIndex + 1)
			];
		}
	}
}
