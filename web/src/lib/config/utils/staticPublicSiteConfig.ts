import type {
	CompanyInformationProgrammerModel,
	MarketingInformationProgrammerModel
} from '$lib/area-public/publicInformation.types';
import {
	getCompanyConfigDefaults,
	getMarketingConfigDefaults
} from '$lib/config/constants/config';

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
