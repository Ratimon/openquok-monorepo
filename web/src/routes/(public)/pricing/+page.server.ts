import type { MetaTagsProps } from 'svelte-meta-tags';
import type { SubscriptionPeriod } from 'openquok-common';

import { publicInformationRepository } from '$lib/area-public';
import { GetPublicPricingPresenter } from '$lib/billing';
import {
	getPublicFaqConfigDefaults,
	CONFIG_SCHEMA_COMPANY,
	CONFIG_SCHEMA_MARKETING
} from '$lib/config/constants/config';
import { configRepository } from '$lib/config/Config.repository.svelte';
import { createMetaData } from '$lib/utils/createMetaData';

export const ssr = true;

export async function load({ url, fetch, cookies }) {
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformation: companyInformationPm, marketingInformation: marketingInformationPm } =
		await publicInformationRepository.getAllInformationCombined(fetch);

	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	let publicFaqConfigPm: Record<string, string> = {};
	try {
		publicFaqConfigPm = await configRepository.getPublicModuleConfig('public_faq');
	} catch (error) {
		console.error('[pricing/+page.server] Failed to fetch public FAQ config:', error);
		publicFaqConfigPm = getPublicFaqConfigDefaults();
	}

	const customTitle = 'Pricing';
	const customDescription =
		'Compare OpenQuok plans for individuals, teams, and agencies. Flexible monthly or yearly billing.';

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${customTitle} | ${companyName}`,
		customDescription,
		customSlug: 'pricing',
		requestUrl: url
	})) satisfies MetaTagsProps;

	const canonical = new URL(url.pathname, url.origin).href;
	const pageMetaTags = Object.freeze({
		canonical,
		openGraph: {
			title: String(CONFIG_SCHEMA_MARKETING.META_TITLE.default),
			description: String(CONFIG_SCHEMA_MARKETING.META_DESCRIPTION.default)
		},
		...metaTags
	}) satisfies MetaTagsProps;

	const presenter = new GetPublicPricingPresenter();

	const monthlyPeriod: SubscriptionPeriod = 'MONTHLY';
	const yearlyPeriod: SubscriptionPeriod = 'YEARLY';
	const pageVmMonthly = presenter.buildPageVm(monthlyPeriod);
	const pageVmYearly = presenter.buildPageVm(yearlyPeriod);

	const schemaData = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: customTitle,
		description: customDescription,
		url: canonical,
		isPartOf: {
			'@type': 'WebSite',
			name: companyName,
			url: url.origin
		},
		offers: pageVmMonthly.plans.map((plan) => ({
			'@type': 'Offer',
			name: plan.name,
			category: 'subscription',
			priceCurrency: 'USD',
			price: plan.monthPrice,
			url: canonical
		}))
	};

	return {
		pageMetaTags,
		isLoggedIn,
		pageVmMonthly,
		pageVmYearly,
		defaultPeriod: monthlyPeriod,
		schemaData,
		publicFaqConfigPm
	};
}

