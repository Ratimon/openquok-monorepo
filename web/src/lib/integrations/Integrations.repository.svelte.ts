import type { HttpGateway } from '$lib/core/HttpGateway';
import { ApiError } from '$lib/core/HttpGateway';

export type SocialProviderIdentifier = string;

/** Programmer model for a catalog integration entry (returned by repository). */
export interface IntegrationCatalogItemProgrammerModel {
	identifier: string;
	name: string;
	toolTip?: string;
	editor?: string;
	isExternal?: boolean;
	isWeb3?: boolean;
	isChromeExtension?: boolean;
	extensionCookies?: unknown;
	customFields?: unknown;
}

export interface GetIntegrationsCatalogResponseDto {
	success?: boolean;
	data?: {
		social?: IntegrationCatalogItemProgrammerModel[];
		article?: IntegrationCatalogItemProgrammerModel[]
	};
	[key: string]: unknown;
}

/** Programmer model for a connected integration list entry (returned by repository). */
export interface ConnectedIntegrationProgrammerModel {
	id: string;
	internalId: string;
	name: string;
	identifier: string;
	picture: string | null;
	disabled: boolean;
	editor: string;
	type: string;
	inBetweenSteps: boolean;
	refreshNeeded: boolean;
	isCustomFields: boolean;
	customFields?: unknown;
	display: string | null;
	time: unknown[];
	changeProfilePicture: boolean;
	changeNickName: boolean;
	customer: { id: string; name: string } | null;
	additionalSettings: string;
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

export interface GetIntegrationListResponseDto {
	success?: boolean;
	data?: { integrations?: ConnectedIntegrationProgrammerModel[] };
	[key: string]: unknown;
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

	public async getCatalog(): Promise<IntegrationCatalogItemProgrammerModel[]> {
		try {
			const { ok, data: dto } =
				await this.httpGateway.get<GetIntegrationsCatalogResponseDto>(this.config.endpoints.catalog, undefined, {
					withCredentials: true
				});
			if (ok) {
				// backend: `{ success: true, data: { social: [...] } }`
				if (dto?.success === true && Array.isArray(dto?.data?.social)) return dto.data.social;
				// legacy fallbacks (keep flexible)
				if (Array.isArray(dto)) return dto as unknown as IntegrationCatalogItemProgrammerModel[];
				if (Array.isArray((dto as { integrations?: unknown })?.integrations))
					return (dto as { integrations: IntegrationCatalogItemProgrammerModel[] }).integrations;
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

	public async listConnectedIntegrations(organizationId: string): Promise<ConnectedIntegrationProgrammerModel[]> {
		try {
			const { ok, data: dto } =
				await this.httpGateway.get<GetIntegrationListResponseDto>(
					this.config.endpoints.listByOrganization,
					{ organizationId },
					{ withCredentials: true }
				);
			const list = dto?.data?.integrations;
			if (ok && dto?.success === true && Array.isArray(list)) return list;
			return [];
		} catch {
			return [];
		}
	}
}

