import type {
	CompanyInformationProgrammerModel,
	MarketingInformationProgrammerModel
} from '$lib/area-public/publicInformation.types';
import {
	getCompanyConfigDefaults,
	getMarketingConfigDefaults
} from '$lib/config/constants/config';
import { mergeModuleConfigDefaults } from '$lib/config/utils/mergeModuleConfigDefaults';

export function getStaticCompanyInformationPm(): CompanyInformationProgrammerModel {
	return {
		module_name: 'company_information',
		config: getCompanyConfigDefaults(),
		updated_at: ''
	};
}

export function getStaticMarketingInformationPm(): MarketingInformationProgrammerModel {
	return {
		module_name: 'marketing_information',
		config: getMarketingConfigDefaults(),
		updated_at: ''
	};
}

/** Git-managed company + marketing config used during prerender and optional anonymous SSR. */
export function loadStaticMergedPublicLayoutConfig(): {
	marketingConfig: Record<string, string>;
	companyConfig: Record<string, string>;
	marketingInformationPm: MarketingInformationProgrammerModel;
	companyInformationPm: CompanyInformationProgrammerModel;
} {
	const staticCompanyInformationPm = getStaticCompanyInformationPm();
	const staticMarketingInformationPm = getStaticMarketingInformationPm();
	const marketingConfig = mergeModuleConfigDefaults(getMarketingConfigDefaults(), undefined);
	const companyConfig = mergeModuleConfigDefaults(getCompanyConfigDefaults(), undefined);

	return {
		marketingConfig,
		companyConfig,
		marketingInformationPm: {
			module_name: staticMarketingInformationPm.module_name,
			config: marketingConfig,
			updated_at: staticMarketingInformationPm.updated_at
		},
		companyInformationPm: {
			module_name: staticCompanyInformationPm.module_name,
			config: companyConfig,
			updated_at: staticCompanyInformationPm.updated_at
		}
	};
}
