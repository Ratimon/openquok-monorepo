import type { RbacRepository } from '$lib/rbac/Rbac.repository.svelte';
import type { AppRole, AppPermission } from '$lib/rbac/rbac.types';

export interface RoleViewModel {
	role: AppRole;
	permissions: AppPermission[];
}

export class GetRolePresenter {
	constructor(private readonly rbacRepository: RbacRepository) {}

	async loadRolesWithPermissions(): Promise<RoleViewModel[]> {
		const rolePermissions = await this.rbacRepository
			.getAllRolePermissions();

		const roleMap = rolePermissions.reduce(
			(acc, { role, permission }) => {
				if (!acc[role]) acc[role] = [];
				acc[role].push(permission);
				return acc;
			},
			{} as Record<AppRole, AppPermission[]>
		);

		const roleOrder: AppRole[] = ['editor', 'admin'];
		return roleOrder.map((role) => ({
			role,
			permissions: (roleMap[role] ?? []).sort()
		}));
	}
}
