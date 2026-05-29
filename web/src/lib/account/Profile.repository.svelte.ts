import type { HttpGateway } from '$lib/core/HttpGateway';
import { ApiError, HttpMethod } from '$lib/core/HttpGateway';
import type { UserMeWorkspaceSession } from 'openquok-common';

export interface AccountConfig {
	endpoints: {
		me: string;
		mePassword: string;
		meRequestChangePassword: string;
		organizations: string;
		changeOrg: string;
		joinOrg: string;
		subscription: string;
	};
}

/**
 * DTOs (IO boundary)
 */
export interface UserProfileDto {
	id: string;
	email: string | null;
	fullName: string | null;
	isEmailVerified: boolean;
	avatarUrl: string | null;
	websiteUrl: string | null;
}

/** GET /users/me payload (profile; optional workspace session when `organizationId` query is set). */
export type GetMeDataDto = UserProfileDto & {
	roles?: string[];
	isPlatformAdmin?: boolean;
	impersonate?: boolean;
} & Partial<UserMeWorkspaceSession>;

export interface GetProfileResponseDto {
	success: boolean;
	data: GetMeDataDto;
	message?: string;
}

export interface UpdateProfileResponseDto {
	success: boolean;
	message: string;
}

export interface UpdatePasswordResponseDto {
	success: boolean;
	message: string;
}

export interface RequestChangePasswordEmailResponseDto {
	success: boolean;
	message: string;
}

/**
 * Programmer Model (business layer)
 */
export interface UserProfileProgrammerModel {
	id: string;
	email: string | null;
	fullName: string | null;
	isEmailVerified: boolean;
	avatarUrl: string | null;
	websiteUrl: string | null;
}

export interface UpdateProfileProgrammerModel {
	success: boolean;
	message: string;
}

export interface UpdatePasswordProgrammerModel {
	success: boolean;
	message: string;
}

export interface RequestChangePasswordEmailProgrammerModel {
	success: boolean;
	message: string;
}

export function toUserProfilePm(dto: UserProfileDto): UserProfileProgrammerModel {
	return {
		id: dto.id,
		email: dto.email ?? null,
		fullName: dto.fullName ?? null,
		isEmailVerified: dto.isEmailVerified === true,
		avatarUrl: dto.avatarUrl ?? null,
		websiteUrl: dto.websiteUrl ?? null
	};
}

export class ProfileRepository {
	public profilePm = $state<UserProfileProgrammerModel | null>(null);

	constructor(
		private readonly httpGateway: HttpGateway,
		private readonly config: AccountConfig
	) {}

	/** POST /users/change-org — sets `showorg` cookie for cookie-aware /users/me and /billing routes. */
	public async changeOrganization(organizationId: string): Promise<{ success: boolean; id?: string }> {
		try {
			const { ok, data: changeOrgDto } = await this.httpGateway.post<{
				success: boolean;
				data?: { id?: string };
			}>(this.config.endpoints.changeOrg, { id: organizationId }, { withCredentials: true });
			if (ok && changeOrgDto?.success && changeOrgDto.data?.id) {
				return { success: true, id: changeOrgDto.data.id };
			}
			return { success: false };
		} catch {
			return { success: false };
		}
	}

	/** POST /users/join-org — body `org` invite token (or `joinOrg` cookie). */
	public async joinOrganization(token?: string): Promise<{ success: boolean; organizationId: string | null }> {
		try {
			const { ok, data: joinOrgDto } = await this.httpGateway.post<{
				success: boolean;
				data?: { id?: string | null };
			}>(
				this.config.endpoints.joinOrg,
				token?.trim() ? { org: token.trim() } : {},
				{ withCredentials: true }
			);
			if (ok && joinOrgDto?.success) {
				return { success: true, organizationId: joinOrgDto.data?.id ?? null };
			}
			return { success: false, organizationId: null };
		} catch {
			return { success: false, organizationId: null };
		}
	}

	/** Active workspace from `showorg` cookie via GET /users/me (session `orgId`). */
	public async getActiveWorkspaceIdFromSession(): Promise<string | null> {
		try {
			const { ok, data: getProfileDto } = await this.httpGateway.get<GetProfileResponseDto>(
				this.config.endpoints.me,
				undefined,
				{ withCredentials: true }
			);
			if (!ok || !getProfileDto?.success || !getProfileDto.data) return null;
			const orgId = getProfileDto.data.orgId;
			return typeof orgId === 'string' && orgId.trim() ? orgId.trim() : null;
		} catch {
			return null;
		}
	}

	public async getProfile(
		options?: { organizationId?: string; fetch?: typeof globalThis.fetch }
	): Promise<UserProfileProgrammerModel | null> {
		const fetchFn = options?.fetch;
		const query =
			options?.organizationId?.trim() ?
				{ organizationId: options.organizationId.trim() }
			:	undefined;
		try {
			const { ok, data: getProfileDto } =
				await this.httpGateway.get<GetProfileResponseDto>(this.config.endpoints.me, query, {
					withCredentials: true,
					...(fetchFn && { fetch: fetchFn })
				});
			if (ok && getProfileDto?.success && getProfileDto?.data) {
				const pm = toUserProfilePm(getProfileDto.data);
				this.profilePm = pm;
				return pm;
			}
			this.profilePm = null;
			return null;
		} catch {
			this.profilePm = null;
			return null;
		}
	}

	public async updateProfile(updates: {
		fullName?: string;
		avatarUrl?: string | null;
		websiteUrl?: string | null;
	}): Promise<UpdateProfileProgrammerModel> {
		try {
			const { ok, data: updateProfileDto } =
				await this.httpGateway.request<UpdateProfileResponseDto>({
					method: HttpMethod.PATCH,
					url: this.config.endpoints.me,
					data: updates,
					withCredentials: true
				});
			if (ok && updateProfileDto) {
				if (this.profilePm) {
					this.profilePm = {
						...this.profilePm,
						...(updates.fullName !== undefined && { fullName: updates.fullName }),
						...(updates.avatarUrl !== undefined && { avatarUrl: updates.avatarUrl }),
						...(updates.websiteUrl !== undefined && { websiteUrl: updates.websiteUrl })
					};
				}
				return { success: true, message: updateProfileDto.message ?? 'Profile updated successfully' };
			}
			return {
				success: false,
				message: (updateProfileDto as { message?: string })?.message ?? 'Update failed'
			};
		} catch (error) {
			if (
				error instanceof ApiError &&
				typeof error.data === 'object' &&
				error.data !== null &&
				'message' in error.data
			) {
				return { success: false, message: String((error.data as { message: string }).message) };
			}
			return { success: false, message: 'Failed to update profile. Please try again.' };
		}
	}

	public async updatePassword(password: string): Promise<UpdatePasswordProgrammerModel> {
		try {
			const { ok, data: updatePasswordDto } =
				await this.httpGateway.put<UpdatePasswordResponseDto>(
					this.config.endpoints.mePassword,
					{ password },
					{ withCredentials: true }
				);
			if (ok && updatePasswordDto) {
				return { success: true, message: updatePasswordDto.message ?? 'Password updated successfully' };
			}
			return {
				success: false,
				message: (updatePasswordDto as { message?: string })?.message ?? 'Update failed'
			};
		} catch (error) {
			if (
				error instanceof ApiError &&
				typeof error.data === 'object' &&
				error.data !== null &&
				'message' in error.data
			) {
				return { success: false, message: String((error.data as { message: string }).message) };
			}
			return { success: false, message: 'Failed to update password. Please try again.' };
		}
	}

	public async requestChangePasswordEmail(): Promise<RequestChangePasswordEmailProgrammerModel> {
		try {
			const { ok, data: requestChangePasswordEmailDto } =
				await this.httpGateway.request<RequestChangePasswordEmailResponseDto>({
					method: HttpMethod.POST,
					url: this.config.endpoints.meRequestChangePassword,
					withCredentials: true
				});
			if (ok && requestChangePasswordEmailDto?.success) {
				return {
					success: true,
					message:
						requestChangePasswordEmailDto.message ??
						'Check your email for a link to change your password.'
				};
			}
			return {
				success: false,
				message: (requestChangePasswordEmailDto as { message?: string })?.message ?? 'Failed to send email.'
			};
		} catch (error) {
			if (
				error instanceof ApiError &&
				typeof error.data === 'object' &&
				error.data !== null &&
				'message' in error.data
			) {
				return { success: false, message: String((error.data as { message: string }).message) };
			}
			return { success: false, message: 'Failed to send email. Please try again.' };
		}
	}
}

