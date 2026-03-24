import type { GetUserPresenter, ExtendedFullUserViewModel } from '$lib/user-management/GetUser.presenter.svelte';
import type { RbacRepository } from '$lib/rbac/Rbac.repository.svelte';
import type { AppRole } from '$lib/rbac/rbac.types';

export class AdminRoleManagerPagePresenter {
	public allUsersToManageVm: ExtendedFullUserViewModel[] = $state([]);
	public showToastMessage = $state(false);
	public toastMessage = $state('');

	constructor(
		private readonly getUserPresenter: GetUserPresenter,
		private readonly rbacRepository: RbacRepository
	) {}

	async load(): Promise<void> {
		this.allUsersToManageVm = await this.getUserPresenter.loadFullUsersWithRoles();
	}

	/** Update VM only after role was assigned (e.g. from modal success). No API call, no toast. */
	applyUserRoleAdd(userId: string, role: AppRole): void {
		this._applyUserRoleAdd(userId, role);
	}

	/** Update VM only after role was removed (e.g. from modal success). No API call, no toast. */
	applyUserRoleRemove(userId: string, role: AppRole): void {
		this._applyUserRoleRemove(userId, role);
	}

	async assignRoleToUser(userId: string, role: AppRole): Promise<void> {
		const resultPm = await this.rbacRepository.assignRole(userId, role);
		if (resultPm.success) {
			this._applyUserRoleAdd(userId, role);
			this.showToastMessage = true;
			this.toastMessage = resultPm.message ?? 'Role assigned.';
		} else {
			this.showToastMessage = true;
			this.toastMessage = resultPm.message ?? 'Failed to assign role.';
		}
	}

	async removeRoleFromUser(userId: string, role: AppRole): Promise<void> {
		const resultPm = await this.rbacRepository.removeRole(userId, role);
		if (resultPm.success) {
			this._applyUserRoleRemove(userId, role);
			this.showToastMessage = true;
			this.toastMessage = resultPm.message ?? 'Role removed.';
		} else {
			this.showToastMessage = true;
			this.toastMessage = resultPm.message ?? 'Failed to remove role.';
		}
	}

	private _applyUserRoleAdd(userId: string, role: AppRole): void {
		const index = this.allUsersToManageVm.findIndex((u) => u.id === userId);
		if (index >= 0) {
			const user = this.allUsersToManageVm[index];
			if (!user.roles.includes(role)) {
				this.allUsersToManageVm = [
					...this.allUsersToManageVm.slice(0, index),
					{ ...user, roles: [...user.roles, role] },
					...this.allUsersToManageVm.slice(index + 1)
				];
			}
		}
	}

	private _applyUserRoleRemove(userId: string, role: AppRole): void {
		const index = this.allUsersToManageVm.findIndex((u) => u.id === userId);
		if (index >= 0) {
			const user = this.allUsersToManageVm[index];
			this.allUsersToManageVm = [
				...this.allUsersToManageVm.slice(0, index),
				{ ...user, roles: user.roles.filter((r) => r !== role) },
				...this.allUsersToManageVm.slice(index + 1)
			];
		}
	}
}
