import type { HttpGateway } from '$lib/core/HttpGateway';
import { httpGateway } from '$lib/core/index';

export interface ModuleConfigResponseDto {
	success: boolean;
	data: Record<string, unknown>;
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
		updateConfig: string;
	};
}

export class ModuleConfigRepository {
	constructor(
		private readonly httpGateway: HttpGateway,
		private readonly config: ModuleConfigConfig
	) {}

	public async getModuleConfig(moduleName: string): Promise<Record<string, string>> {
		try {
			const { data: moduleConfigDto, ok } = await this.httpGateway.get<ModuleConfigResponseDto>(
				this.config.endpoints.getModuleConfig,
				{ moduleName },
				{ withCredentials: true }
			);

			if (ok && moduleConfigDto?.success && moduleConfigDto.data) {
				return Object.fromEntries(
					Object.entries(moduleConfigDto.data).map(([key, value]) => [key, value == null ? '' : String(value)])
				);
			}
		} catch {
			// Fallback handled at presenter/UI layer.
		}

		return {};
	}

	public async getPublicModuleConfig(moduleName: string): Promise<Record<string, string>> {
		try {
			const { data: moduleConfigDto, ok } = await this.httpGateway.get<ModuleConfigResponseDto>(
				this.config.endpoints.getPublicModuleConfig,
				{ moduleName },
				{ withCredentials: false }
			);

			if (ok && moduleConfigDto?.success && moduleConfigDto.data) {
				return Object.fromEntries(
					Object.entries(moduleConfigDto.data).map(([key, value]) => [key, value == null ? '' : String(value)])
				);
			}
		} catch {
			// Fallback handled at presenter/UI layer.
		}

		return {};
	}

	public async updateConfig(
		moduleName: string,
		newConfig: Record<string, string | boolean>
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
		updateConfig: '/api/v1/admin/config'
	}
};

export const configRepository = new ModuleConfigRepository(httpGateway, moduleConfigConfig);

