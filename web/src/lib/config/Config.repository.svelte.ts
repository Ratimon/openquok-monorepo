import type { HttpGateway } from '$lib/core/HttpGateway';
import { httpGateway } from '$lib/core/index';

export interface ModuleConfigResponseDto {
	success: boolean;
	data: Record<string, unknown>;
	message: string;
}

export interface PublicCompanyInformationPm {
	module_name: string;
	config: Record<string, unknown>;
	updated_at: string;
}

export interface GetPublicCompanyInformationResponseDto {
	success: boolean;
	data: PublicCompanyInformationPm;
	message: string;
}

export interface UpsertModuleResponseDto {
	success: boolean;
	data: {
		isSaved: boolean;
	};
	message: string;
}

export interface ModuleConfigConfig {
	endpoints: {
		getModuleConfig: string;
		getPublicModuleConfig: string;
		getPublicCompanyInformation: string;
		updateConfig: string;
	};
}

function normalizeModuleConfigPayload(data: Record<string, unknown>): Record<string, unknown> {
	return Object.fromEntries(
		Object.entries(data).map(([key, value]) => {
			if (value == null) return [key, ''];
			if (typeof value === 'object') return [key, value];
			if (typeof value === 'boolean') return [key, value];
			return [key, String(value)];
		})
	);
}

export class ModuleConfigRepository {
	constructor(
		private readonly httpGateway: HttpGateway,
		private readonly config: ModuleConfigConfig
	) {}

	public async getModuleConfig(moduleName: string): Promise<Record<string, unknown>> {
		try {
			const { data: moduleConfigDto, ok } = await this.httpGateway.get<ModuleConfigResponseDto>(
				this.config.endpoints.getModuleConfig,
				{ moduleName },
				{ withCredentials: true }
			);

			if (ok && moduleConfigDto?.success && moduleConfigDto.data) {
				return normalizeModuleConfigPayload(moduleConfigDto.data);
			}
		} catch {
			// Fallback handled at presenter/UI layer.
		}

		return {};
	}

	public async getPublicModuleConfig(
		moduleName: string,
		fetch?: typeof globalThis.fetch
	): Promise<Record<string, unknown>> {
		try {
			const { data: moduleConfigDto, ok } = await this.httpGateway.get<ModuleConfigResponseDto>(
				this.config.endpoints.getPublicModuleConfig,
				{ moduleName },
				{ withCredentials: false, fetch }
			);

			if (ok && moduleConfigDto?.success && moduleConfigDto.data) {
				return normalizeModuleConfigPayload(moduleConfigDto.data);
			}
		} catch {
			// Fallback handled at presenter/UI layer.
		}

		return {};
	}

	/** Public company_information row (address, phone, legal name, …) from module_configs. */
	public async getPublicCompanyInformation(
		fetch?: typeof globalThis.fetch
	): Promise<PublicCompanyInformationPm | null> {
		try {
			const { data: companyInformationDto, ok } =
				await this.httpGateway.get<GetPublicCompanyInformationResponseDto>(
					this.config.endpoints.getPublicCompanyInformation,
					undefined,
					{ withCredentials: false, fetch }
				);

			if (ok && companyInformationDto?.success && companyInformationDto.data?.config) {
				return {
					module_name: companyInformationDto.data.module_name ?? 'company_information',
					config: normalizeModuleConfigPayload(
						companyInformationDto.data.config as Record<string, unknown>
					),
					updated_at: companyInformationDto.data.updated_at ?? ''
				};
			}
		} catch {
			// Fallback handled at call site.
		}

		return null;
	}

	public async updateConfig(
		moduleName: string,
		newConfig: Record<string, unknown>
	): Promise<{ success: boolean; message: string; isSaved?: boolean }> {
		const { data: upsertDto, ok } = await this.httpGateway.put<UpsertModuleResponseDto>(
			this.config.endpoints.updateConfig,
			{
				moduleName,
				newConfig
			},
			{ withCredentials: true }
		);

		if (ok && upsertDto?.success) {
			return {
				success: true,
				message: upsertDto.message,
				isSaved: upsertDto.data?.isSaved
			};
		}

		return {
			success: false,
			message: upsertDto?.message ?? 'Failed to update module configuration'
		};
	}
}

const moduleConfigConfig: ModuleConfigConfig = {
	endpoints: {
		getModuleConfig: '/api/v1/admin/config',
		getPublicModuleConfig: '/api/v1/company/config',
		getPublicCompanyInformation: '/api/v1/company/information',
		updateConfig: '/api/v1/admin/config'
	}
};

export const configRepository = new ModuleConfigRepository(httpGateway, moduleConfigConfig);
