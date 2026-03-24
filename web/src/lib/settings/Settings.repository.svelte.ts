import type { HttpGateway } from '$lib/core/HttpGateway';
import { ApiError, HttpMethod } from '$lib/core/HttpGateway';

/**
 * Settings / Organization API config (infra boundary is HttpGateway).
 */
export interface SettingsConfig {
	endpoints: {
		list: string;
		create: string;
		getById: (id: string) => string;
		update: (id: string) => string;
		delete: (id: string) => string;
		getTeam: (id: string) => string;
		invite: (id: string) => string;
		removeTeamMember: (orgId: string, userId: string) => string;
		listPendingInvites: string;
		acceptPendingInvite: (id: string) => string;
		validateInvite: string;
		joinByToken: string;
	};
}

/**
 * DTOs (Infrastructure boundary) — API response shapes.
 * Repository should map DTOs to Programmer Models (PM) before exposing state.
 */
export interface OrganizationWithRoleDto {
	id: string;
	name: string;
	description: string | null;
	apiKey: string | null;
	createdAt: string;
	updatedAt: string;
	workspaceRole: 'user' | 'admin' | 'superadmin';
	disabled: boolean;
	memberCount: number;
}

export interface OrganizationDto {
	id: string;
	name: string;
	description: string | null;
	apiKey: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface ListMyOrganizationsResponseDto {
	success: boolean;
	data: OrganizationWithRoleDto[];
	message?: string;
}

export interface CreateOrganizationResponseDto {
	success: boolean;
	data: OrganizationDto;
	message?: string;
}

export interface TeamMemberDto {
	id: string;
	userId: string;
	organizationId: string;
	workspaceRole: 'user' | 'admin' | 'superadmin';
	disabled: boolean;
	email: string | null;
	fullName: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface GetTeamResponseDto {
	success: boolean;
	data: TeamMemberDto[];
	message?: string;
}

export interface InviteTeamMemberResponseDto {
	success: boolean;
	data?: { url: string; expiresAt: string };
	message?: string;
}

export interface PendingInviteDto {
	id: string;
	organizationId: string;
	organizationName: string;
	workspaceRole: string;
	expiresAt: string;
}

export interface ListPendingInvitesResponseDto {
	success: boolean;
	data: PendingInviteDto[];
	message?: string;
}

export interface ValidateInviteResponseDto {
	success: boolean;
	data: { organizationName: string; workspaceRole: string } | null;
	message?: string;
}

export interface JoinByTokenResponseDto {
	success: boolean;
	data?: { organizationId: string; workspaceRole: 'user' | 'admin' };
	message?: string;
}

/**
 * Programmer Models (Business layer) — what the app uses internally.
 */
export interface OrganizationProgrammerModel {
	id: string;
	name: string;
	description: string | null;
	apiKey: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface OrganizationWithRoleProgrammerModel extends OrganizationProgrammerModel {
	workspaceRole: 'user' | 'admin' | 'superadmin';
	disabled: boolean;
	memberCount: number;
}

export interface TeamMemberProgrammerModel {
	id: string;
	userId: string;
	organizationId: string;
	workspaceRole: 'user' | 'admin' | 'superadmin';
	disabled: boolean;
	email: string | null;
	fullName: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface PendingInviteProgrammerModel {
	id: string;
	organizationId: string;
	organizationName: string;
	workspaceRole: string;
	expiresAt: string;
}

export function toOrganizationPm(dto: OrganizationDto): OrganizationProgrammerModel {
	return {
		id: dto.id,
		name: dto.name,
		description: dto.description ?? null,
		apiKey: dto.apiKey ?? null,
		createdAt: dto.createdAt,
		updatedAt: dto.updatedAt
	};
}

export function toOrganizationWithRolePm(dto: OrganizationWithRoleDto): OrganizationWithRoleProgrammerModel {
	return {
		...toOrganizationPm(dto),
		workspaceRole: dto.workspaceRole,
		disabled: dto.disabled,
		memberCount: dto.memberCount ?? 0
	};
}

export function toTeamMemberPm(dto: TeamMemberDto): TeamMemberProgrammerModel {
	return {
		id: dto.id,
		userId: dto.userId,
		organizationId: dto.organizationId,
		workspaceRole: dto.workspaceRole,
		disabled: dto.disabled,
		email: dto.email ?? null,
		fullName: dto.fullName ?? null,
		createdAt: dto.createdAt,
		updatedAt: dto.updatedAt
	};
}

export class SettingsRepository {
	/** Repository-owned state (Programmer Model) */
	public organizationsPm = $state<OrganizationWithRoleProgrammerModel[]>([]);

	constructor(
		private readonly httpGateway: HttpGateway,
		private readonly config: SettingsConfig
	) {}

	public async listMyOrganizations(): Promise<OrganizationWithRoleProgrammerModel[]> {
		try {
			const { ok, data: listMyOrganizationsDto } = await this.httpGateway.get<ListMyOrganizationsResponseDto>(
				this.config.endpoints.list,
				undefined,
				{ withCredentials: true }
			);
			if (ok && listMyOrganizationsDto?.success && Array.isArray(listMyOrganizationsDto.data)) {
				const mapped = listMyOrganizationsDto.data.map(toOrganizationWithRolePm);
				this.organizationsPm = mapped;
				return mapped;
			}
			this.organizationsPm = [];
			return [];
		} catch {
			this.organizationsPm = [];
			return [];
		}
	}

	public async createOrganization(params: {
		name: string;
		description?: string | null;
	}): Promise<OrganizationProgrammerModel | null> {
		try {
			const { ok, data: createOrganizationDto } = await this.httpGateway.request<CreateOrganizationResponseDto>({
				method: HttpMethod.POST,
				url: this.config.endpoints.create,
				data: { name: params.name.trim(), description: params.description ?? null },
				withCredentials: true
			});
			if (ok && createOrganizationDto?.success && createOrganizationDto.data) {
				return toOrganizationPm(createOrganizationDto.data);
			}
			return null;
		} catch {
			return null;
		}
	}

	public async leaveWorkspace(params: {
		organizationId: string;
		userId: string;
	}): Promise<{ success: boolean; message?: string }> {
		try {
			const url = this.config.endpoints.removeTeamMember(params.organizationId, params.userId);
			const { data: leaveWorkspaceDto, ok } =
				await this.httpGateway.request<{ success: boolean; message?: string }>({
					method: HttpMethod.DELETE,
					url,
					withCredentials: true
				});
			if (ok && leaveWorkspaceDto?.success) {
				this.organizationsPm = this.organizationsPm.filter((o) => o.id !== params.organizationId);
				return { success: true, message: leaveWorkspaceDto.message };
			}
			return { success: false, message: leaveWorkspaceDto?.message };
		} catch (error) {
			if (
				error instanceof ApiError &&
				typeof error.data === 'object' &&
				error.data !== null &&
				'message' in error.data
			) {
				return { success: false, message: String((error.data as { message: string }).message) };
			}
			return { success: false, message: 'Failed to leave workspace.' };
		}
	}

	public async getTeam(organizationId: string): Promise<TeamMemberProgrammerModel[]> {
		try {
			const { ok, data: getTeamDto } = await this.httpGateway.get<GetTeamResponseDto>(
				this.config.endpoints.getTeam(organizationId),
				undefined,
				{ withCredentials: true }
			);
			if (ok && getTeamDto?.success && Array.isArray(getTeamDto.data)) {
				return getTeamDto.data.map(toTeamMemberPm);
			}
			return [];
		} catch {
			return [];
		}
	}

	public async inviteTeamMember(
		organizationId: string,
		params: { email: string; role?: 'user' | 'admin'; sendEmail?: boolean }
	): Promise<{ success: boolean; message?: string }> {
		try {
			const { data: inviteTeamMemberDto, ok } =
				await this.httpGateway.request<InviteTeamMemberResponseDto>({
					method: HttpMethod.POST,
					url: this.config.endpoints.invite(organizationId),
					data: {
						email: params.email.trim(),
						workspaceRole: params.role ?? 'user',
						sendEmail: params.sendEmail ?? true
					},
					withCredentials: true
				});
			if (ok && inviteTeamMemberDto?.success) {
				return { success: true, message: inviteTeamMemberDto.message };
			}
			return {
				success: false,
				message: inviteTeamMemberDto?.message ?? 'Invite failed.'
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
			return { success: false, message: 'Failed to send invite.' };
		}
	}

	public async getPendingInvites(): Promise<PendingInviteProgrammerModel[]> {
		try {
			const { ok, data: listPendingInvitesDto } = await this.httpGateway.get<ListPendingInvitesResponseDto>(
				this.config.endpoints.listPendingInvites,
				undefined,
				{ withCredentials: true }
			);
			if (ok && listPendingInvitesDto?.success && Array.isArray(listPendingInvitesDto.data)) {
				return listPendingInvitesDto.data.map((d) => ({
					id: d.id,
					organizationId: d.organizationId,
					organizationName: d.organizationName,
					workspaceRole: d.workspaceRole,
					expiresAt: d.expiresAt
				}));
			}
			return [];
		} catch {
			return [];
		}
	}

	public async acceptPendingInvite(inviteId: string): Promise<{ success: boolean; message?: string }> {
		try {
			const url = this.config.endpoints.acceptPendingInvite(inviteId);
			const { data: acceptPendingInviteDto, ok } =
				await this.httpGateway.request<{ success: boolean; data?: { organizationId: string; role: string }; message?: string }>({
					method: HttpMethod.POST,
					url,
					withCredentials: true
				});
			if (ok && acceptPendingInviteDto?.success) return { success: true };
			return { success: false, message: acceptPendingInviteDto?.message };
		} catch (error) {
			if (
				error instanceof ApiError &&
				typeof error.data === 'object' &&
				error.data !== null &&
				'message' in error.data
			) {
				return { success: false, message: String((error.data as { message: string }).message) };
			}
			return { success: false, message: 'Failed to accept invite.' };
		}
	}

	public async validateInviteToken(token: string): Promise<{ organizationName: string; role: string } | null> {
		try {
			const { ok, data: validateInviteDto } = await this.httpGateway.get<ValidateInviteResponseDto>(
				this.config.endpoints.validateInvite,
				{ token },
				{ withCredentials: true }
			);
			if (ok && validateInviteDto?.success && validateInviteDto.data) {
				return {
					organizationName: validateInviteDto.data.organizationName,
					role: validateInviteDto.data.workspaceRole
				};
			}
			return null;
		} catch {
			return null;
		}
	}

	public async joinByToken(token: string): Promise<{ success: boolean; message?: string }> {
		try {
			const { data: joinByTokenDto, ok } =
				await this.httpGateway.request<JoinByTokenResponseDto>({
					method: HttpMethod.POST,
					url: this.config.endpoints.joinByToken,
					data: { token },
					withCredentials: true
				});
			if (ok && joinByTokenDto?.success) return { success: true };
			return { success: false, message: joinByTokenDto?.message };
		} catch (error) {
			if (
				error instanceof ApiError &&
				typeof error.data === 'object' &&
				error.data !== null &&
				'message' in error.data
			) {
				return { success: false, message: String((error.data as { message: string }).message) };
			}
			if (error instanceof ApiError && error.status === 401) {
				return { success: false, message: 'You need to sign in to accept this invite.' };
			}
			return { success: false, message: 'Something went wrong while joining. Please try again.' };
		}
	}
}

