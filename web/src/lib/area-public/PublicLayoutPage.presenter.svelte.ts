import {
	CONFIG_SCHEMA_COMPANY,
	getCompanyConfigDefaults
} from '$lib/config/constants/config';

export class PublicLayoutPagePresenter {
	public companyNameVm = $state<string>(CONFIG_SCHEMA_COMPANY.NAME.default as string);
	public companyYearVm = $state<string>(CONFIG_SCHEMA_COMPANY.FOUNDING_YEAR.default as string);
	public companyAddressVm = $state<string>(
		String(CONFIG_SCHEMA_COMPANY.COMPANY_ADDRESS.default ?? '')
	);
	public supportPhoneVm = $state<string>(String(CONFIG_SCHEMA_COMPANY.SUPPORT_PHONE.default ?? ''));
	public supportEmailVm = $state<string>(String(CONFIG_SCHEMA_COMPANY.SUPPORT_EMAIL.default ?? ''));

	constructor() {
		this.applyStaticFooterDefaults();
	}

	public applyStaticFooterDefaults(): void {
		const result = this.loadInfoForFooterStateless(getCompanyConfigDefaults());
		this.companyNameVm = result.companyNameVm;
		this.companyYearVm = result.companyYearVm;
		this.companyAddressVm = result.companyAddressVm;
		this.supportPhoneVm = result.supportPhoneVm;
		this.supportEmailVm = result.supportEmailVm;
	}

	public loadInfoForFooterStateless(
		companyInformationPm: { [key: string]: string } | null
	): {
		companyNameVm: string;
		companyYearVm: string;
		companyAddressVm: string;
		supportPhoneVm: string;
		supportEmailVm: string;
	} {
		const companyNameVm =
			companyInformationPm?.NAME ?? (CONFIG_SCHEMA_COMPANY.NAME.default as string);
		const companyYearVm =
			companyInformationPm?.FOUNDING_YEAR ??
			(CONFIG_SCHEMA_COMPANY.FOUNDING_YEAR.default as string);
		const companyAddressVm =
			companyInformationPm?.COMPANY_ADDRESS ??
			String(CONFIG_SCHEMA_COMPANY.COMPANY_ADDRESS.default ?? '');
		const supportPhoneVm =
			companyInformationPm?.SUPPORT_PHONE ??
			String(CONFIG_SCHEMA_COMPANY.SUPPORT_PHONE.default ?? '');
		const supportEmailVm =
			companyInformationPm?.SUPPORT_EMAIL ??
			String(CONFIG_SCHEMA_COMPANY.SUPPORT_EMAIL.default ?? '');

		return {
			companyNameVm,
			companyYearVm,
			companyAddressVm,
			supportPhoneVm,
			supportEmailVm
		};
	}
}
