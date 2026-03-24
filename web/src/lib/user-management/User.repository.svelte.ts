import type { HttpGateway } from '$lib/core/HttpGateway';
import type { AppRole } from '$lib/rbac/rbac.types';

export interface FullUsersWithRolesResponseDto {
	success?: boolean;
	data?: {
		users: Array<{
			id: string;
			email: string;
			roles: AppRole[];
			isSuperAdmin?: boolean;
			createdAt?: string;
		}>;
	};
	message?: string;
}

export interface FullUserProgrammerModelWithRoles {
	id: string;
	email: string;
	roles: AppRole[];
	isSuperAdmin: boolean;
	createdAt: string;
}

export interface UserConfig {
	endpoints: {
		getFullUsersWithRoles: string;
	};
}

export class UserRepository {
	constructor(
		private readonly httpGateway: HttpGateway,
		private readonly config: UserConfig
	) {}

	async getFullUsersWithRoles(): Promise<FullUserProgrammerModelWithRoles[]> {
		try {
			const { data: dto, ok } = await this.httpGateway.get<FullUsersWithRolesResponseDto>(
				this.config.endpoints.getFullUsersWithRoles,
				undefined,
				{ withCredentials: true }
			);

			if (ok && dto?.data?.users) {
				return dto.data.users.map((u) => ({
					id: u.id,
					email: u.email ?? '',
					roles: Array.isArray(u.roles) ? u.roles : [],
					isSuperAdmin: u.isSuperAdmin ?? false,
					createdAt: u.createdAt ?? ''
				}));
			}
			return [];
		} catch (e) {
			if (typeof window !== 'undefined' && typeof console?.warn === 'function') {
				console.warn('[UserRepository] getFullUsersWithRoles failed:', e);
			}
			return [];
		}
	}
}
