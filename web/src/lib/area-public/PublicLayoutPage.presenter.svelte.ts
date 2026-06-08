import type { PublicInformationRepository } from './PublicInformation.repository.svelte';
import { CONFIG_SCHEMA_COMPANY, CONFIG_SCHEMA_MARKETING } from '$lib/config/constants/config';

export class PublicLayoutPagePresenter {
	public companyNameVm = $state<string>(CONFIG_SCHEMA_COMPANY.NAME.default as string);
	public companyYearVm = $state<string>(CONFIG_SCHEMA_COMPANY.FOUNDING_YEAR.default as string);
	public marketingInformationVm = $state<{ [key: string]: string }>({});

	constructor(private publicInformationRepository: PublicInformationRepository) {}

	public loadInfoForFooterStateless(
		companyInformationPm: { [key: string]: string } | null,
		marketingInformationPm: { [key: string]: string } | null
	): {
		companyNameVm: string;
		companyYearVm: string;
		marketingInformationVm: { [key: string]: string };
	} {
		const marketingProperties = [
			'SOCIAL_LINKS_X',
			'SOCIAL_LINKS_FACEBOOK',
			'SOCIAL_LINKS_INSTAGRAM',
			'SOCIAL_LINKS_YOUTUBE'
		];
		const companyNameVm = companyInformationPm?.NAME ?? (CONFIG_SCHEMA_COMPANY.NAME.default as string);
		const companyYearVm =
			companyInformationPm?.FOUNDING_YEAR ?? (CONFIG_SCHEMA_COMPANY.FOUNDING_YEAR.default as string);

		const marketingInformationVm: { [key: string]: string } = {};
		const schema = CONFIG_SCHEMA_MARKETING as Record<string, { default?: string }>;
		for (const p of marketingProperties) {
			const fromApi = marketingInformationPm?.[p];
			marketingInformationVm[p] =
				typeof fromApi === 'string' ? fromApi : (schema[p]?.default ?? '');
		}
		return { companyNameVm, companyYearVm, marketingInformationVm };
	}

	public async loadInfoForFooter(): Promise<void> {
		const companyProperties = ['FOUNDING_YEAR', 'NAME'];
		const marketingProperties = [
			'SOCIAL_LINKS_X',
			'SOCIAL_LINKS_FACEBOOK',
			'SOCIAL_LINKS_INSTAGRAM',
			'SOCIAL_LINKS_YOUTUBE'
		];
		const { companyInformation, marketingInformation } =
			await this.publicInformationRepository.getInformationByPropertiesCombined(
				companyProperties,
				marketingProperties
			);
		const result = this.loadInfoForFooterStateless(companyInformation, marketingInformation);
		this.companyNameVm = result.companyNameVm;
		this.companyYearVm = result.companyYearVm;
		this.marketingInformationVm = result.marketingInformationVm;
	}
}
