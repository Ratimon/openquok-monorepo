import type { HttpGateway } from '$lib/core/HttpGateway';
import { ApiError } from '$lib/core/HttpGateway';

export type SocialProviderIdentifier = string;

/** Rows returned on `pages` after Instagram (Business) OAuth (same shape as the former list endpoint). */
export type InstagramBusinessConnectPageRow = {
	id: string;
	pageId: string;
	name: string;
	pictureUrl: string;
};

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
	/** Instead of customer, Workspace channel group assigned to this integration (UI term: group). */
	group: { id: string; name: string } | null;
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

export interface ConnectSocialProgrammerModel {
	state: string;
	code: string;
	timezone: string;
	refresh?: string;
}

/** Payload returned after POST `/integrations/social-connect/:provider` succeeds. */
export interface ConnectSocialSuccessProgrammerModel {
	id: string;
	organizationId: string;
	internalId: string;
	name: string;
	picture: string | null;
	providerIdentifier: string;
	type: string;
	disabled: boolean;
	inBetweenSteps: boolean;
	refreshNeeded: boolean;
	onboarding: boolean;
	pages?: InstagramBusinessConnectPageRow[];
}

export interface ConnectSocialResponseDto {
	success?: boolean;
	data?: ConnectSocialSuccessProgrammerModel;
	message?: string;
	[key: string]: unknown;
}

export interface GetIntegrationListResponseDto {
	success?: boolean;
	data?: { integrations?: ConnectedIntegrationProgrammerModel[] };
	[key: string]: unknown;
}

/** Global plug catalog entry (threshold-style rules per provider). */
export type PlugFieldCatalogPm = {
	name: string;
	description: string;
	type: string;
	placeholder: string;
	validation?: string;
};

export type GlobalPlugCatalogEntryPm = {
	methodName: string;
	identifier: string;
	title: string;
	description: string;
	runEveryMilliseconds: number;
	totalRuns: number;
	fields: PlugFieldCatalogPm[];
};

export type PlugCatalogProviderPm = {
	name: string;
	identifier: string;
	plugs: GlobalPlugCatalogEntryPm[];
};

export type IntegrationPlugRowPm = {
	id: string;
	organization_id: string;
	integration_id: string;
	plug_function: string;
	data: string;
	activated: boolean;
};

export interface IntegrationsConfig {
	endpoints: {
		catalog: string;
		socialAuthorize: (provider: SocialProviderIdentifier) => string;
		connectSocial: (provider: SocialProviderIdentifier) => string;
		listByOrganization: string;
		customers: string;
		integrationGroup: (integrationId: string) => string;
		disable: string;
		enable: string;
		deleteChannel: string;
		providerConnect: (integrationId: string) => string;
		publicProviderConnect: (integrationId: string) => string;
		postingTimes: (integrationId: string) => string;
		plugList: string;
		integrationPlugs: (integrationId: string) => string;
		integrationPlugActivate: (plugId: string) => string;
		integrationPlugDelete: (plugId: string) => string;
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
			const path = this.config.endpoints.socialAuthorize(params.provider);
			const { ok, data: dto } =
				await this.httpGateway.get<GetAuthorizeUrlResponseDto>(
					path,
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

	public async connectSocial(
		provider: SocialProviderIdentifier,
		body: ConnectSocialProgrammerModel
	): Promise<{ ok: true; data: ConnectSocialSuccessProgrammerModel } | { ok: false; error: string }> {
		try {
			const { ok, data: dto } =
				await this.httpGateway.post<ConnectSocialResponseDto>(
					this.config.endpoints.connectSocial(provider),
					body,
					{ withCredentials: true }
				);
			if (ok && dto?.success === true && dto.data) {
				return { ok: true, data: dto.data };
			}
			const message =
				typeof dto?.message === 'string'
					? dto.message
					: typeof (dto as { error?: string })?.error === 'string'
						? (dto as { error: string }).error
						: null;
			return { ok: false, error: message || 'Failed to connect integration.' };
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
			if (ok && dto?.success === true && Array.isArray(list)) {
				return list.map((row) => {
					const raw = row as Omit<ConnectedIntegrationProgrammerModel, 'group'> & {
						customer?: { id: string; name: string } | null;
						group?: { id: string; name: string } | null;
					};
					const { customer, group: groupFromPayload, ...rest } = raw;
					return {
						...rest,
						group: groupFromPayload ?? customer ?? null
					} satisfies ConnectedIntegrationProgrammerModel;
				});
			}
			return [];
		} catch {
			return [];
		}
	}

	public async deleteChannel(params: {
		organizationId: string;
		integrationId: string;
	}): Promise<{ ok: true } | { ok: false; error: string }> {
		try {
			await this.httpGateway.delete(this.config.endpoints.deleteChannel, {
				data: { organizationId: params.organizationId, id: params.integrationId },
				withCredentials: true
			});
			return { ok: true };
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
			return { ok: false, error: 'Could not remove this channel.' };
		}
	}

	/** POST `/integrations/provider/:id/connect` — provider-specific body (e.g. Instagram Business: `pageId`, `id`). */
	public async saveProviderPage(params: {
		organizationId: string;
		integrationId: string;
		pageId: string;
		id: string;
		state?: string;
	}): Promise<{ ok: true } | { ok: false; error: string }> {
		try {
			const { organizationId, integrationId, pageId, id, state } = params;
			const payload = state
				? { state, pageId, id }
				: { organizationId, pageId, id };
			const endpoint = state
				? this.config.endpoints.publicProviderConnect(integrationId)
				: this.config.endpoints.providerConnect(integrationId);
			const { ok, data: dto } = await this.httpGateway.post<{
				success?: boolean;
				data?: { success?: boolean };
			}>(
				endpoint,
				payload,
				{ withCredentials: true }
			);
			if (ok && dto?.success === true && dto.data?.success === true) return { ok: true };
			return { ok: false, error: 'Could not complete channel setup.' };
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
			return { ok: false, error: 'Could not complete channel setup.' };
		}
	}

	public async listChannelCustomers(organizationId: string): Promise<{ id: string; name: string }[]> {
		try {
			const { ok, data: dto } = await this.httpGateway.get<{
				success?: boolean;
				data?: { customers?: { id: string; name: string }[] };
			}>(this.config.endpoints.customers, { organizationId }, { withCredentials: true });
			const list = dto?.data?.customers;
			if (ok && dto?.success === true && Array.isArray(list)) return list;
			return [];
		} catch {
			return [];
		}
	}

	public async createChannelCustomer(params: {
		organizationId: string;
		name: string;
	}): Promise<{ ok: true; id: string; name: string } | { ok: false; error: string }> {
		try {
			const { ok, data: dto } = await this.httpGateway.post<{
				success?: boolean;
				data?: { id: string; name: string };
				message?: string;
			}>(this.config.endpoints.customers, params, { withCredentials: true });
			if (ok && dto?.success === true && dto.data?.id && dto.data?.name) {
				return { ok: true, id: dto.data.id, name: dto.data.name };
			}
			const message = typeof dto?.message === 'string' ? dto.message : null;
			return { ok: false, error: message || 'Could not create channel group.' };
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
			return { ok: false, error: 'Could not create channel group.' };
		}
	}

	public async assignChannelCustomer(params: {
		organizationId: string;
		integrationId: string;
		customerId: string | null;
	}): Promise<{ ok: true } | { ok: false; error: string }> {
		try {
			const { organizationId, integrationId, customerId } = params;
			const { ok, data: dto } = await this.httpGateway.put<{
				success?: boolean;
				message?: string;
			}>(
				this.config.endpoints.integrationGroup(integrationId),
				{ organizationId, customerId },
				{ withCredentials: true }
			);
			if (ok && dto?.success === true) return { ok: true };
			const message = typeof dto?.message === 'string' ? dto.message : null;
			return { ok: false, error: message || 'Could not update channel group.' };
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
			return { ok: false, error: 'Could not update channel group.' };
		}
	}

	public async setIntegrationPostingTimes(params: {
		organizationId: string;
		integrationId: string;
		time: { time: number }[];
	}): Promise<{ ok: true } | { ok: false; error: string }> {
		try {
			const { ok, data: dto } = await this.httpGateway.post<{
				success?: boolean;
				data?: { ok?: boolean };
				message?: string;
			}>(
				this.config.endpoints.postingTimes(params.integrationId),
				{ time: params.time },
				{ withCredentials: true, params: { organizationId: params.organizationId } }
			);
			if (ok && dto?.success === true && dto.data?.ok === true) return { ok: true };
			const message = typeof dto?.message === 'string' ? dto.message : null;
			return { ok: false, error: message || 'Could not save time slots.' };
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
			return { ok: false, error: 'Could not save time slots.' };
		}
	}

	public async getPlugCatalog(): Promise<PlugCatalogProviderPm[]> {
		try {
			const { ok, data: dto } = await this.httpGateway.get<{
				success?: boolean;
				data?: { plugs?: PlugCatalogProviderPm[] };
			}>(this.config.endpoints.plugList, undefined, { withCredentials: true });
			const plugs = dto?.data?.plugs;
			if (ok && dto?.success === true && Array.isArray(plugs)) return plugs;
			return [];
		} catch {
			return [];
		}
	}

	public async listIntegrationPlugs(
		organizationId: string,
		integrationId: string
	): Promise<IntegrationPlugRowPm[]> {
		try {
			const path = this.config.endpoints.integrationPlugs(integrationId);
			const { ok, data: dto } = await this.httpGateway.get<{
				success?: boolean;
				data?: { plugs?: IntegrationPlugRowPm[] };
			}>(path, { organizationId }, { withCredentials: true });
			const plugs = dto?.data?.plugs;
			if (ok && dto?.success === true && Array.isArray(plugs)) return plugs;
			return [];
		} catch {
			return [];
		}
	}

	public async upsertIntegrationPlug(params: {
		organizationId: string;
		integrationId: string;
		func: string;
		fields: { name: string; value: string }[];
		plugId?: string;
	}): Promise<{ ok: true; id: string; activated: boolean } | { ok: false; error: string }> {
		try {
			const path = this.config.endpoints.integrationPlugs(params.integrationId);
			const { ok, data: dto } = await this.httpGateway.post<{
				success?: boolean;
				data?: { id?: string; activated?: boolean };
				message?: string;
			}>(
				path,
				{
					func: params.func,
					fields: params.fields,
					...(params.plugId ? { plugId: params.plugId } : {})
				},
				{ withCredentials: true, params: { organizationId: params.organizationId } }
			);
			if (
				ok &&
				dto?.success === true &&
				dto.data &&
				typeof dto.data.activated === 'boolean' &&
				typeof dto.data.id === 'string'
			) {
				return { ok: true, id: dto.data.id, activated: dto.data.activated };
			}
			const message = typeof dto?.message === 'string' ? dto.message : null;
			return { ok: false, error: message || 'Could not save plug.' };
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
			return { ok: false, error: 'Could not save plug.' };
		}
	}

	public async deleteIntegrationPlug(params: {
		organizationId: string;
		plugId: string;
	}): Promise<{ ok: true } | { ok: false; error: string }> {
		try {
			const path = this.config.endpoints.integrationPlugDelete(params.plugId);
			const { ok, data: dto } = await this.httpGateway.delete<{ success?: boolean; message?: string }>(
				path,
				{ params: { organizationId: params.organizationId }, withCredentials: true }
			);
			if (ok && dto?.success === true) return { ok: true };
			const message = typeof dto?.message === 'string' ? dto.message : null;
			return { ok: false, error: message || 'Could not delete plug.' };
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
			return { ok: false, error: 'Could not delete plug.' };
		}
	}

	public async setIntegrationPlugActivated(params: {
		organizationId: string;
		plugId: string;
		activated: boolean;
	}): Promise<{ ok: true } | { ok: false; error: string }> {
		try {
			const path = this.config.endpoints.integrationPlugActivate(params.plugId);
			const { ok, data: dto } = await this.httpGateway.put<{ success?: boolean; message?: string }>(
				path,
				{ organizationId: params.organizationId, activated: params.activated },
				{ withCredentials: true }
			);
			if (ok && dto?.success === true) return { ok: true };
			const message = typeof dto?.message === 'string' ? dto.message : null;
			return { ok: false, error: message || 'Could not update plug.' };
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
			return { ok: false, error: 'Could not update plug.' };
		}
	}

	public async setChannelDisabled(params: {
		organizationId: string;
		integrationId: string;
		disabled: boolean;
	}): Promise<{ ok: true } | { ok: false; error: string }> {
		try {
			const url = params.disabled ? this.config.endpoints.disable : this.config.endpoints.enable;
			await this.httpGateway.post(url, { organizationId: params.organizationId, id: params.integrationId }, {
				withCredentials: true
			});
			return { ok: true };
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
			return { ok: false, error: 'Could not update this channel.' };
		}
	}
}

