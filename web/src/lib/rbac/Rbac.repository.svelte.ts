import type { HttpGateway } from '$lib/core/HttpGateway';
import { ApiError } from '$lib/core/HttpGateway';
import type { AppRole, AppPermission } from '$lib/rbac/rbac.types';

/** One role / permission pair from {@link RbacRepository.getAllRolePermissions}. */
export interface RbacRolePermissionProgrammerModel {
	role: AppRole;
	permission: AppPermission;
}

/** RBAC assign/remove permission or role — repository PM boundary. */
export interface RbacMutationProgrammerModel {
	success: boolean;
	message: string;
}

export interface GetAllRolePermissionsResponseDto {
	success: boolean;
	data: {
		permissions: RbacRolePermissionProgrammerModel[];
	};
}

export interface AssignPermissionToRoleResponseDto {
	success: boolean;
	message: string;
	data: { id: string | null };
}

export interface RemovePermissionFromRoleResponseDto {
	success: boolean;
	message: string;
}

export interface AssignRoleResponseDto {
	success: boolean;
	message: string;
	data?: { roleId: string | null };
}

export interface RemoveRoleResponseDto {
	success: boolean;
	message: string;
}

export interface RbacConfig {
	endpoints: {
		getAllRolePermissions: string;
		assignPermissionToRole: string;
		removePermissionFromRole: string;
		assignRole: string;
		removeRole: string;
	};
}

export class RbacRepository {
	constructor(
		private readonly httpGateway: HttpGateway,
		private readonly config: RbacConfig
	) {}

	async getAllRolePermissions(): Promise<RbacRolePermissionProgrammerModel[]> {
		const { data: getAllRolePermissionsDto, ok } =
			await this.httpGateway.get<GetAllRolePermissionsResponseDto>(
				this.config.endpoints.getAllRolePermissions
			);

		if (ok && getAllRolePermissionsDto?.data?.permissions) {
			return getAllRolePermissionsDto.data.permissions;
		}
		return [];
	}

	async assignPermissionToRole(
		role: AppRole,
		permission: AppPermission
	): Promise<RbacMutationProgrammerModel> {
		try {
			const url = this.config.endpoints.assignPermissionToRole
				.replace(':role', role)
				.replace(':permission', permission);
			const { data: assignPermissionToRoleDto, ok } =
				await this.httpGateway.post<AssignPermissionToRoleResponseDto>(url, {});

			if (ok && assignPermissionToRoleDto?.success) {
				return { success: true, message: assignPermissionToRoleDto.message ?? 'Permission assigned' };
			}
			return { success: false, message: assignPermissionToRoleDto?.message ?? 'Failed to assign permission' };
		} catch (err) {
			if (err instanceof ApiError) {
				const body = err.data as { message?: string } | undefined;
				return { success: false, message: body?.message ?? err.message };
			}
			return { success: false, message: 'Failed to assign permission to role' };
		}
	}

	async removePermissionFromRole(
		role: AppRole,
		permission: AppPermission
	): Promise<RbacMutationProgrammerModel> {
		try {
			const url = this.config.endpoints.removePermissionFromRole
				.replace(':role', role)
				.replace(':permission', permission);
			const { data: removePermissionFromRoleDto, ok } =
				await this.httpGateway.delete<RemovePermissionFromRoleResponseDto>(url);

			if (ok && removePermissionFromRoleDto?.success) {
				return { success: true, message: removePermissionFromRoleDto.message ?? 'Permission removed' };
			}
			return { success: false, message: removePermissionFromRoleDto?.message ?? 'Failed to remove permission' };
		} catch (err) {
			if (err instanceof ApiError) {
				const body = err.data as { message?: string } | undefined;
				return { success: false, message: body?.message ?? err.message };
			}
			return { success: false, message: 'Failed to remove permission from role' };
		}
	}

	async assignRole(userId: string, role: AppRole): Promise<RbacMutationProgrammerModel> {
		try {
			const url = this.config.endpoints.assignRole
				.replace(':userId', userId)
				.replace(':role', role);
			const { data: assignRoleDto, ok } =
				await this.httpGateway.post<AssignRoleResponseDto>(url, {});

			if (ok && assignRoleDto?.success) {
				return { success: true, message: assignRoleDto.message ?? 'Role assigned' };
			}
			return { success: false, message: assignRoleDto?.message ?? 'Failed to assign role' };
		} catch (err) {
			if (err instanceof ApiError) {
				const body = err.data as { message?: string } | undefined;
				return { success: false, message: body?.message ?? err.message };
			}
			return { success: false, message: 'Failed to assign role' };
		}
	}

	async removeRole(userId: string, role: AppRole): Promise<RbacMutationProgrammerModel> {
		try {
			const url = this.config.endpoints.removeRole
				.replace(':userId', userId)
				.replace(':role', role);
			const { data: removeRoleDto, ok } =
				await this.httpGateway.delete<RemoveRoleResponseDto>(url);

			if (ok && removeRoleDto?.success) {
				return { success: true, message: removeRoleDto.message ?? 'Role removed' };
			}
			return { success: false, message: removeRoleDto?.message ?? 'Failed to remove role' };
		} catch (err) {
			if (err instanceof ApiError) {
				const body = err.data as { message?: string } | undefined;
				return { success: false, message: body?.message ?? err.message };
			}
			return { success: false, message: 'Failed to remove role' };
		}
	}
}
