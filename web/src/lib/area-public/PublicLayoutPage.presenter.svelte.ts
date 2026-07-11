import {
	CONFIG_SCHEMA_COMPANY,
	getCompanyConfigDefaults
} from '$lib/config/constants/config';

export class PublicLayoutPagePresenter {
	public companyNameVm = $state<string>(CONFIG_SCHEMA_COMPANY.NAME.default as string);
	public companyYearVm = $state<string>(CONFIG_SCHEMA_COMPANY.FOUNDING_YEAR.default as string);

	constructor() {
		this.applyStaticFooterDefaults();
	}

	public applyStaticFooterDefaults(): void {
		const result = this.loadInfoForFooterStateless(getCompanyConfigDefaults());
		this.companyNameVm = result.companyNameVm;
		this.companyYearVm = result.companyYearVm;
	}

	public loadInfoForFooterStateless(
		companyInformationPm: { [key: string]: string } | null
	): {
		companyNameVm: string;
		companyYearVm: string;
	} {
		const companyNameVm =
			companyInformationPm?.NAME ?? (CONFIG_SCHEMA_COMPANY.NAME.default as string);
		const companyYearVm =
			companyInformationPm?.FOUNDING_YEAR ??
			(CONFIG_SCHEMA_COMPANY.FOUNDING_YEAR.default as string);

		return { companyNameVm, companyYearVm };
	}
}
