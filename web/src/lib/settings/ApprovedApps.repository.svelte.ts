import type { HttpGateway } from '$lib/core/HttpGateway';
import { ApiError, HttpMethod } from '$lib/core/HttpGateway';

/** Wire payload from GET `/users/me/approved-apps` (snake_case). Internal to repository mapping. */
interface ApprovedAuthorizationWireDto {
	id: string;
	oauth_app_id: string;
	user_id: string;
	organization_id: string;
	created_at: string;
	updated_at: string;
	oauth_app: {
		id: string;
		organization_id: string;
		name: string;
		description: string | null;
		picture_id: string | null;
		redirect_url: string;
		client_id: string;
		picture_public_url: string | null;
		picture_thumbnail_public_url: string | null;
		created_at: string;
		updated_at: string;
	} | null;
}

interface ListApprovedAppsResponseDto {
	success: boolean;
	data?: ApprovedAuthorizationWireDto[];
	message?: string;
}

export interface ApprovedOauthAppProgrammerModel {
	id: string;
	organizationId: string;
	name: string;
	description: string | null;
	pictureId: string | null;
	redirectUrl: string;
	clientId: string;
	picturePublicUrl: string | null;
	pictureThumbnailPublicUrl: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface ApprovedAuthorizationProgrammerModel {
	id: string;
	oauthAppId: string;
	userId: string;
	organizationId: string;
	createdAt: string;
	updatedAt: string;
	oauthApp: ApprovedOauthAppProgrammerModel | null;
}

export type ListApprovedAppsProgrammerModel =
	| { ok: true; items: ApprovedAuthorizationProgrammerModel[] }
	| { ok: false; message: string };

export type RevokeApprovedAppMutationProgrammerModel =
	| { ok: true }
	| { ok: false; message: string };

export interface ApprovedAppsRepositoryConfig {
	list: string;
	revoke: (authorizationId: string) => string;
}

function parseApiMessage(data: unknown): string | undefined {
	if (typeof data !== 'object' || data === null) return undefined;
	if ('message' in data && typeof (data as { message: unknown }).message === 'string') {
		return (data as { message: string }).message;
	}
	return undefined;
}

function toApprovedOauthAppPm(
	row: NonNullable<ApprovedAuthorizationWireDto['oauth_app']>
): ApprovedOauthAppProgrammerModel {
	return {
		id: row.id,
		organizationId: row.organization_id,
		name: row.name,
		description: row.description ?? null,
		pictureId: row.picture_id ?? null,
		redirectUrl: row.redirect_url,
		clientId: row.client_id,
		picturePublicUrl: row.picture_public_url ?? null,
		pictureThumbnailPublicUrl: row.picture_thumbnail_public_url ?? null,
		createdAt: row.created_at,
		updatedAt: row.updated_at
	};
}

export function toApprovedAuthorizationPm(dto: ApprovedAuthorizationWireDto): ApprovedAuthorizationProgrammerModel {
	return {
		id: dto.id,
		oauthAppId: dto.oauth_app_id,
		userId: dto.user_id,
		organizationId: dto.organization_id,
		createdAt: dto.created_at,
		updatedAt: dto.updated_at,
		oauthApp: dto.oauth_app ? toApprovedOauthAppPm(dto.oauth_app) : null
	};
}

export class ApprovedAppsRepository {
	constructor(
		private readonly httpGateway: HttpGateway,
		private readonly config: ApprovedAppsRepositoryConfig
	) {}

	public async list(): Promise<ListApprovedAppsProgrammerModel> {
		try {
			const { ok, data: dto } = await this.httpGateway.request<ListApprovedAppsResponseDto>({
				method: HttpMethod.GET,
				url: this.config.list,
				withCredentials: true
			});
			if (ok && dto?.success && Array.isArray(dto.data)) {
				const items = dto.data.map(toApprovedAuthorizationPm);
				return { ok: true, items };
			}
			return { ok: false, message: dto?.message ?? 'Failed to load approved apps.' };
		} catch (error) {
			if (error instanceof ApiError) {
				return { ok: false, message: parseApiMessage(error.data) ?? error.message };
			}
			return { ok: false, message: 'Failed to load approved apps.' };
		}
	}

	public async revoke(authorizationId: string): Promise<RevokeApprovedAppMutationProgrammerModel> {
		try {
			const url = this.config.revoke(authorizationId);
			const { ok, data: dto } = await this.httpGateway.request<{ success?: boolean; message?: string }>({
				method: HttpMethod.DELETE,
				url,
				withCredentials: true
			});
			if (ok && dto && typeof dto === 'object' && dto.success === true) return { ok: true };
			return { ok: false, message: parseApiMessage(dto) ?? 'Failed to revoke access.' };
		} catch (error) {
			if (error instanceof ApiError) {
				return { ok: false, message: parseApiMessage(error.data) ?? error.message };
			}
			return { ok: false, message: 'Failed to revoke access.' };
		}
	}
}
