import type { HttpGateway } from '$lib/core/HttpGateway';
import type { ModuleConfigSchema } from '$lib/config/constants/types';
import { CONFIG_SCHEMA_COMPANY, CONFIG_SCHEMA_MARKETING } from '$lib/config/constants/config';

export interface GetCompanyInformationByPropertiesResponseDto {
	success: boolean;
	message: string;
	data: { [key: string]: string };
}

export interface GetAllCompanyInformationResponseDto {
	success: boolean;
	data: CompanyInformationProgrammerModel;
	message: string;
}

export interface CompanyInformationProgrammerModel {
	module_name: string;
	config: Record<string, unknown>;
	updated_at: string;
}

export interface MarketingInformationProgrammerModel {
	module_name: string;
	config: Record<string, unknown>;
	updated_at: string;
}

export interface GetAllInformationCombinedResponseDto {
	success: boolean;
	message: string;
	data: {
		companyInformation: CompanyInformationProgrammerModel;
		marketingInformation: MarketingInformationProgrammerModel;
	};
}

export interface GetInformationByPropertiesCombinedResponseDto {
	success: boolean;
	message: string;
	data: {
		companyInformation: { [key: string]: string };
		marketingInformation: { [key: string]: string };
	};
}

export interface PublicInformationConfig {
	endpoints: {
		companyInformationByProperties: string;
		companyInformation: string;
		informationCombined: string;
		informationByPropertiesCombined: string;
	};
}

/** Build a programmer model from schema defaults (for fallback when API is unavailable). */
function fallbackFromSchema(
	moduleName: string,
	schema: ModuleConfigSchema
): CompanyInformationProgrammerModel {
	const config: Record<string, unknown> = {};
	for (const [key, entry] of Object.entries(schema)) {
		config[key] = entry.default != null ? String(entry.default) : '';
	}
	return {
		module_name: moduleName,
		config,
		updated_at: new Date().toISOString()
	};
}

const FALLBACK_COMPANY = fallbackFromSchema('company_information', CONFIG_SCHEMA_COMPANY);
const FALLBACK_MARKETING = fallbackFromSchema('marketing_information', CONFIG_SCHEMA_MARKETING);

export class PublicInformationRepository {
	private httpGateway: HttpGateway;
	private config: PublicInformationConfig;

	constructor(httpGateway: HttpGateway, config: PublicInformationConfig) {
		this.httpGateway = httpGateway;
		const defaults: Partial<PublicInformationConfig> = {
			endpoints: {
				companyInformationByProperties: '/api/v1/company/information/properties',
				companyInformation: '/api/v1/company/information',
				informationCombined: '/api/v1/company/information/combined',
				informationByPropertiesCombined: '/api/v1/company/information/properties/combined'
			}
		};
		this.config = { ...defaults, ...config } as PublicInformationConfig;
	}

	public async getAllInformationCombined(
		fetch?: typeof globalThis.fetch
	): Promise<{
		companyInformation: CompanyInformationProgrammerModel | null;
		marketingInformation: MarketingInformationProgrammerModel | null;
	}> {
		try {
			const { data: getAllInformationCombinedDto, ok } =
				await this.httpGateway.get<GetAllInformationCombinedResponseDto>(
					this.config.endpoints.informationCombined,
					undefined,
					fetch ? { fetch } : undefined
				);

			if (ok && getAllInformationCombinedDto?.data) {
				return {
					companyInformation: getAllInformationCombinedDto.data.companyInformation,
					marketingInformation: getAllInformationCombinedDto.data.marketingInformation
				};
			}
		} catch {
			return { companyInformation: FALLBACK_COMPANY, marketingInformation: FALLBACK_MARKETING };
		}
		return { companyInformation: FALLBACK_COMPANY, marketingInformation: FALLBACK_MARKETING };
	}

	public async getInformationByPropertiesCombined(
		companyProperties: string[],
		marketingProperties: string[],
		fetch?: typeof globalThis.fetch
	): Promise<{
		companyInformation: { [key: string]: string } | null;
		marketingInformation: { [key: string]: string } | null;
	}> {
		try {
			const { data: getInformationByPropertiesCombinedDto, ok } =
				await this.httpGateway.get<GetInformationByPropertiesCombinedResponseDto>(
					this.config.endpoints.informationByPropertiesCombined,
					{
						companyProperties: companyProperties.join(','),
						marketingProperties: marketingProperties.join(',')
					},
					fetch ? { fetch } : undefined
				);

			if (ok && getInformationByPropertiesCombinedDto?.data) {
				return {
					companyInformation: getInformationByPropertiesCombinedDto.data.companyInformation,
					marketingInformation: getInformationByPropertiesCombinedDto.data.marketingInformation
				};
			}
		} catch {
			return {
				companyInformation: FALLBACK_COMPANY.config as Record<string, string>,
				marketingInformation: FALLBACK_MARKETING.config as Record<string, string>
			};
		}
		return {
			companyInformation: FALLBACK_COMPANY.config as Record<string, string>,
			marketingInformation: FALLBACK_MARKETING.config as Record<string, string>
		};
	}
}
