import type { UserRepository } from '$lib/user-management/User.repository.svelte';
import type { AppRole } from '$lib/rbac/rbac.types';

export interface ExtendedFullUserViewModel {
	id: string;
	email: string;
	roles: AppRole[];
	isSuperAdmin: boolean;
	createdAt: string;
}

export class GetUserPresenter {
	constructor(private readonly userRepository: UserRepository) {}

	async loadFullUsersWithRoles(): Promise<ExtendedFullUserViewModel[]> {
		const usersPm = await this.userRepository.getFullUsersWithRoles();
		return usersPm.map((u) => ({
			id: u.id,
			email: u.email,
			roles: u.roles,
			isSuperAdmin: u.isSuperAdmin,
			createdAt: u.createdAt
		}));
	}
}
