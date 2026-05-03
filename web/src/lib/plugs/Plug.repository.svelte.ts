import type { HttpGateway } from '$lib/core/HttpGateway';
import { ApiError } from '$lib/core/HttpGateway';

/** Global plug catalog entry (threshold-style rules per provider). */
export type PlugFieldCatalogProgrammerModel = {
	name: string;
	description: string;
	type: string;
	placeholder: string;
	validation?: string;
};

export type GlobalPlugCatalogEntryProgrammerModel = {
	methodName: string;
	identifier: string;
	title: string;
	description: string;
	runEveryMilliseconds: number;
	totalRuns: number;
	fields: PlugFieldCatalogProgrammerModel[];
};

export type PlugCatalogProviderProgrammerModel = {
	name: string;
	identifier: string;
	plugs: GlobalPlugCatalogEntryProgrammerModel[];
};

export type IntegrationPlugRowProgrammerModel = {
	id: string;
	organization_id: string;
	integration_id: string;
	plug_function: string;
	data: string;
	activated: boolean;
};

/** Result of creating or updating a plug rule (repository maps wire response to a discriminated union). */
export type PlugUpsertProgrammerModel =
	| { ok: true; id: string; activated: boolean }
	| { ok: false; error: string };

export interface PlugRepositoryConfig {
	endpoints: {
		plugList: string;
		integrationPlugs: (integrationId: string) => string;
		integrationPlugActivate: (plugId: string) => string;
		integrationPlugDelete: (plugId: string) => string;
	};
}

export class PlugRepository {
	constructor(
		private readonly httpGateway: HttpGateway,
		private readonly config: PlugRepositoryConfig
	) {}

	public async getPlugCatalog(): Promise<PlugCatalogProviderProgrammerModel[]> {
		try {
			const { ok, data: dto } = await this.httpGateway.get<{
				success?: boolean;
				data?: { plugs?: PlugCatalogProviderProgrammerModel[] };
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
	): Promise<IntegrationPlugRowProgrammerModel[]> {
		try {
			const path = this.config.endpoints.integrationPlugs(integrationId);
			const { ok, data: dto } = await this.httpGateway.get<{
				success?: boolean;
				data?: { plugs?: IntegrationPlugRowProgrammerModel[] };
			}>(path, { organizationId }, { withCredentials: true });
			const plugsPm = dto?.data?.plugs;
			if (ok && dto?.success === true && Array.isArray(plugsPm)) return plugsPm;
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
	}): Promise<PlugUpsertProgrammerModel> {
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
	}): Promise<PlugUpsertProgrammerModel> {
		try {
			const path = this.config.endpoints.integrationPlugDelete(params.plugId);
			const { ok, data: dto } = await this.httpGateway.delete<{ success?: boolean; message?: string }>(
				path,
				{ params: { organizationId: params.organizationId }, withCredentials: true }
			);
			if (ok && dto?.success === true) return { ok: true, id: params.plugId, activated: true };
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
	}): Promise<PlugUpsertProgrammerModel> {
		try {
			const path = this.config.endpoints.integrationPlugActivate(params.plugId);
			const { ok, data: dto } = await this.httpGateway.put<{ success?: boolean; message?: string }>(
				path,
				{ organizationId: params.organizationId, activated: params.activated },
				{ withCredentials: true }
			);
			if (ok && dto?.success === true) return { ok: true, id: params.plugId, activated: params.activated };
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
}
