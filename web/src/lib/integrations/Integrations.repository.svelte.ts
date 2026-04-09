import type { HttpGateway } from '$lib/core/HttpGateway';
import { ApiError } from '$lib/core/HttpGateway';

export type SocialProviderIdentifier = string;

export interface IntegrationCatalogItemDto {
	identifier: string;
	name: string;
	type?: string;
	editor?: string;
}

export interface GetIntegrationsCatalogResponseDto {
	/**
	 * Legacy shapes (keep flexible):
	 * - `[...]`
	 * - `{ integrations: [...] }`
	 */
	integrations?: IntegrationCatalogItemDto[];
	/**
	 * Current backend shape:
	 * `{ success: true, data: { social: [...], article: [...] } }`
	 */
	success?: boolean;
	data?: {
		social?: IntegrationCatalogItemDto[];
		article?: IntegrationCatalogItemDto[];
	};
	[key: string]: unknown;
}

export interface GetAuthorizeUrlResponseDto {
	/** legacy: `{ url }` */
	url?: string;
	err?: boolean;
	/** current backend: `{ success: true, data: { url } }` */
	success?: boolean;
	data?: {
		url?: string;
		err?: boolean;
	};
	[key: string]: unknown;
}

export interface ConnectSocialBody {
	state: string;
	code: string;
	timezone: string;
	refresh?: string;
}

export interface ConnectedIntegrationDto {
	id: string;
	name: string;
	identifier: string;
	picture?: string | null;
	disabled?: boolean;
	profile?: string | null;
}

export interface GetIntegrationListResponseDto {
	integrations?: Array<{
		id: string;
		name: string;
		identifier: string;
		picture?: string | null;
		disabled?: boolean;
		profile?: string | null;
	}>;
}

export interface IntegrationsConfig {
	endpoints: {
		catalog: string;
		getAuthorizeUrl: (provider: SocialProviderIdentifier) => string;
		connectSocial: (provider: SocialProviderIdentifier) => string;
		listByOrganization: string;
	};
}

export class IntegrationsRepository {
	constructor(
		private readonly httpGateway: HttpGateway,
		private readonly config: IntegrationsConfig
	) {}

	public async getCatalog(): Promise<IntegrationCatalogItemDto[]> {
		try {
			const { ok, data: dto } =
				await this.httpGateway.get<GetIntegrationsCatalogResponseDto>(this.config.endpoints.catalog, undefined, {
					withCredentials: true
				});
			if (ok) {
				// backend: either `{ success, data: { social: [...] } }` or `{ integrations: [...] }` or `[...]` (legacy); normalize
				if (Array.isArray(dto)) return dto as unknown as IntegrationCatalogItemDto[];
				if (dto?.success === true && dto?.data?.social && Array.isArray(dto.data.social)) {
					return dto.data.social;
				}
				if (dto?.integrations && Array.isArray(dto.integrations)) return dto.integrations;
			}
			return [];
		} catch {
			return [];
		}
	}

	public async getAuthorizeUrl(params: {
		organizationId: string;
		provider: SocialProviderIdentifier;
		refresh?: string;
		onboarding?: string;
		externalUrl?: string;
	}): Promise<{ url: string } | { error: string }> {
		try {
			const { ok, data: dto } =
				await this.httpGateway.get<GetAuthorizeUrlResponseDto>(
					this.config.endpoints.getAuthorizeUrl(params.provider),
					{
						organizationId: params.organizationId,
						...(params.refresh && { refresh: params.refresh }),
						...(params.onboarding && { onboarding: params.onboarding }),
						...(params.externalUrl && { externalUrl: params.externalUrl })
					},
					{ withCredentials: true }
				);
			if (ok) {
				// backend currently wraps: `{ success: true, data: { url } }`
				const url = dto?.data?.url ?? dto?.url;
				if (url) return { url };
				// If backend returns `{ err: true }` inside `data`, surface a better message.
				if (dto?.data?.err || dto?.err) {
					return { error: 'Failed to generate an authorization URL (provider returned an error).' };
				}
			}
			return { error: 'Failed to generate an authorization URL.' };
		} catch (error) {
			if (
				error instanceof ApiError &&
				typeof error.data === 'object' &&
				error.data !== null &&
				'message' in error.data
			) {
				return { error: String((error.data as { message: string }).message) };
			}
			return { error: 'Failed to generate an authorization URL.' };
		}
	}

	public async connectSocial(provider: SocialProviderIdentifier, body: ConnectSocialBody): Promise<{ ok: true } | { ok: false; error: string }> {
		try {
			const { ok } =
				await this.httpGateway.post(this.config.endpoints.connectSocial(provider), body, {
					withCredentials: true
				});
			return ok ? { ok: true } : { ok: false, error: 'Failed to connect integration.' };
		} catch (error) {
			if (
				error instanceof ApiError &&
				typeof error.data === 'object' &&
				error.data !== null &&
				('message' in error.data || 'msg' in error.data)
			) {
				return {
					ok: false,
					error: String(
						(error.data as { message?: string; msg?: string }).message ??
							(error.data as { message?: string; msg?: string }).msg
					)
				};
			}
			return { ok: false, error: 'Failed to connect integration.' };
		}
	}

	public async listConnectedIntegrations(organizationId: string): Promise<ConnectedIntegrationDto[]> {
		try {
			const { ok, data: dto } =
				await this.httpGateway.get<GetIntegrationListResponseDto>(
					this.config.endpoints.listByOrganization,
					{ organizationId },
					{ withCredentials: true }
				);
			if (ok && dto?.integrations && Array.isArray(dto.integrations)) {
				return dto.integrations.map((i) => ({
					id: i.id,
					name: i.name,
					identifier: i.identifier,
					picture: i.picture ?? null,
					disabled: i.disabled ?? false,
					profile: i.profile ?? null
				}));
			}
			return [];
		} catch {
			return [];
		}
	}
}

