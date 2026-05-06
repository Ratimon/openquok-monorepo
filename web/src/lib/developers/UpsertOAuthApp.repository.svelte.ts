import type { HttpGateway } from '$lib/core/HttpGateway';
import { ApiError, HttpMethod } from '$lib/core/HttpGateway';

export interface OAuthAppsConfig {
	endpoints: {
		getApp: (organizationId: string) => string;
		create: string;
		update: string;
		delete: (oauthAppId: string, organizationId: string) => string;
		rotateSecret: string;
	};
}

/** Wire shape from GET/PUT (Supabase row fields). */
export interface OauthAppWireDto {
	id: string;
	organization_id: string;
	name: string;
	description: string | null;
	picture_id: string | null;
	redirect_url: string;
	client_id: string;
	created_at: string;
	updated_at: string;
}

export interface GetOauthAppResponseDto {
	success: boolean;
	data: OauthAppWireDto | false;
	message?: string;
}

export interface CreateOauthAppResponseDto {
	success: boolean;
	data?: OauthAppWireDto & { clientId: string; clientSecret: string };
	message?: string;
}

export interface UpdateOauthAppResponseDto {
	success: boolean;
	data?: OauthAppWireDto;
	message?: string;
}

export interface RotateOauthSecretResponseDto {
	success: boolean;
	data?: { clientSecret: string };
	message?: string;
}

export interface OauthAppProgrammerModel {
	id: string;
	organizationId: string;
	name: string;
	description: string | null;
	pictureId: string | null;
	redirectUrl: string;
	clientId: string;
	createdAt: string;
	updatedAt: string;
}

export function toOauthAppPm(dto: OauthAppWireDto): OauthAppProgrammerModel {
	return {
		id: dto.id,
		organizationId: dto.organization_id,
		name: dto.name,
		description: dto.description ?? null,
		pictureId: dto.picture_id ?? null,
		redirectUrl: dto.redirect_url,
		clientId: dto.client_id,
		createdAt: dto.created_at,
		updatedAt: dto.updated_at
	};
}

function parseApiMessage(data: unknown): string | undefined {
	if (typeof data !== 'object' || data === null) return undefined;
	if ('message' in data && typeof (data as { message: unknown }).message === 'string') {
		return (data as { message: string }).message;
	}
	return undefined;
}

export class OAuthAppsRepository {
	constructor(
		private readonly httpGateway: HttpGateway,
		private readonly config: OAuthAppsConfig
	) {}

	public async getApp(
		organizationId: string
	): Promise<
		{ ok: true; appPm: OauthAppProgrammerModel | null } | { ok: false; forbidden: boolean; message?: string }
	> {
		try {
			const { ok, data: dto } = await this.httpGateway.get<GetOauthAppResponseDto>(
				this.config.endpoints.getApp(organizationId),
				undefined,
				{ withCredentials: true }
			);
			if (!ok || !dto?.success || dto.data === false || dto.data === null) {
				return { ok: true, appPm: null };
			}
			return { ok: true, appPm: toOauthAppPm(dto.data) };
		} catch (error) {
			if (error instanceof ApiError && error.status === 403) {
				return { ok: false, forbidden: true, message: parseApiMessage(error.data) };
			}
			return { ok: true, appPm: null };
		}
	}

	public async createApp(params: {
		organizationId: string;
		name: string;
		description?: string | null;
		redirectUrl: string;
		pictureId?: string | null;
	}): Promise<
		{ ok: true; appPm: OauthAppProgrammerModel; clientSecret: string } | { ok: false; message: string }
	> {
		try {
			const { ok, data: dto } = await this.httpGateway.request<CreateOauthAppResponseDto>({
				method: HttpMethod.POST,
				url: this.config.endpoints.create,
				data: {
					organizationId: params.organizationId,
					name: params.name.trim(),
					description: params.description ?? null,
					redirectUrl: params.redirectUrl.trim(),
					pictureId: params.pictureId ?? null
				},
				withCredentials: true
			});
			if (ok && dto?.success && dto.data?.id && dto.data.clientSecret) {
				const { clientSecret, ...rest } = dto.data;
				const wire = rest as OauthAppWireDto;
				return { ok: true, appPm: toOauthAppPm(wire), clientSecret };
			}
			return { ok: false, message: dto?.message ?? 'Failed to create OAuth app.' };
		} catch (error) {
			if (error instanceof ApiError) {
				return { ok: false, message: parseApiMessage(error.data) ?? error.message };
			}
			return { ok: false, message: 'Failed to create OAuth app.' };
		}
	}

	public async updateApp(params: {
		organizationId: string;
		oauthAppId: string;
		name?: string;
		description?: string | null;
		redirectUrl?: string;
		pictureId?: string | null;
	}): Promise<{ ok: true; appPm: OauthAppProgrammerModel } | { ok: false; message: string }> {
		try {
			const { ok, data: dto } = await this.httpGateway.request<UpdateOauthAppResponseDto>({
				method: HttpMethod.PUT,
				url: this.config.endpoints.update,
				data: {
					organizationId: params.organizationId,
					oauthAppId: params.oauthAppId,
					name: params.name?.trim(),
					description: params.description,
					redirectUrl: params.redirectUrl?.trim(),
					pictureId: params.pictureId
				},
				withCredentials: true
			});
			if (ok && dto?.success && dto.data) {
				return { ok: true, appPm: toOauthAppPm(dto.data) };
			}
			return { ok: false, message: dto?.message ?? 'Failed to update OAuth app.' };
		} catch (error) {
			if (error instanceof ApiError) {
				return { ok: false, message: parseApiMessage(error.data) ?? error.message };
			}
			return { ok: false, message: 'Failed to update OAuth app.' };
		}
	}

	public async deleteApp(organizationId: string, oauthAppId: string): Promise<{ ok: true } | { ok: false; message: string }> {
		try {
			const url = this.config.endpoints.delete(oauthAppId, organizationId);
			const { ok, data: dto } = await this.httpGateway.request<{ success: boolean; message?: string }>({
				method: HttpMethod.DELETE,
				url,
				withCredentials: true
			});
			if (ok && dto?.success) return { ok: true };
			return { ok: false, message: dto?.message ?? 'Failed to delete OAuth app.' };
		} catch (error) {
			if (error instanceof ApiError) {
				return { ok: false, message: parseApiMessage(error.data) ?? error.message };
			}
			return { ok: false, message: 'Failed to delete OAuth app.' };
		}
	}

	public async rotateSecret(
		organizationId: string,
		oauthAppId: string
	): Promise<{ ok: true; clientSecret: string } | { ok: false; message: string }> {
		try {
			const { ok, data: dto } = await this.httpGateway.request<RotateOauthSecretResponseDto>({
				method: HttpMethod.POST,
				url: this.config.endpoints.rotateSecret,
				data: { organizationId, oauthAppId },
				withCredentials: true
			});
			if (ok && dto?.success && dto.data?.clientSecret) {
				return { ok: true, clientSecret: dto.data.clientSecret };
			}
			return { ok: false, message: dto?.message ?? 'Failed to rotate client secret.' };
		} catch (error) {
			if (error instanceof ApiError) {
				return { ok: false, message: parseApiMessage(error.data) ?? error.message };
			}
			return { ok: false, message: 'Failed to rotate client secret.' };
		}
	}
}
