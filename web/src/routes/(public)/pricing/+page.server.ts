import type { MetaTagsProps } from 'svelte-meta-tags';
import type { SubscriptionPeriod } from 'openquok-common';

import { GetPublicPricingPresenter } from '$lib/billing';
import {
	CONFIG_SCHEMA_COMPANY,
	CONFIG_SCHEMA_MARKETING
} from '$lib/config/constants/config';
import { configRepository } from '$lib/config/Config.repository.svelte';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
import { parsePublicFaqConfigModule } from '$lib/content/utils/parsePublicFaqConfig';
import { createMetaData } from '$lib/utils/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/utils/buildCanonicalUrl';
import { createJsonLdGraph, filterNonEmptyJsonLdNodes } from '$lib/utils/jsonLdSchema';

export const ssr = true;

export async function load({ url, cookies, parent }) {
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformationPm, marketingInformationPm } = await parent();

	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	let publicFaqRaw: Record<string, unknown> | null = null;
	try {
		const loaded = await configRepository.getPublicModuleConfig('public_faq');
		if (Object.keys(loaded).length > 0) {
			publicFaqRaw = loaded;
		}
	} catch (error) {
		console.error('[pricing/+page.server] Failed to fetch public FAQ config:', error);
	}

	const { configVm: publicFaqConfigPm, itemsVm: publicFaqItemsVm } =
		parsePublicFaqConfigModule(publicFaqRaw);

	const customTitle = 'Pricing';
	const customDescription =
		'Compare OpenQuok plans for individuals, teams, and agencies. Start with a 7-day free trial — schedule social media posts across every connected channel.';

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${customTitle} | ${companyName}`,
		customDescription,
		customSlug: 'pricing',
		customTags: [
			'social media scheduler',
			'social media scheduling tool',
			'social media scheduler free',
			'free social media scheduling tools',
			'schedule social media posts'
		],
		requestUrl: url
	})) satisfies MetaTagsProps;

	const canonical = buildCanonicalUrl(url);
	const pageMetaTags = withCanonicalMetaTags(metaTags, canonical, {
		openGraph: {
			title: String(CONFIG_SCHEMA_MARKETING.META_TITLE.default),
			description: String(CONFIG_SCHEMA_MARKETING.META_DESCRIPTION.default)
		}
	});

	const presenter = new GetPublicPricingPresenter();

	const monthlyPeriod: SubscriptionPeriod = 'MONTHLY';
	const yearlyPeriod: SubscriptionPeriod = 'YEARLY';
	const pageVmMonthly = presenter.buildPageVm(monthlyPeriod);
	const pageVmYearly = presenter.buildPageVm(yearlyPeriod);

	const schemaData = createJsonLdGraph(
		filterNonEmptyJsonLdNodes([
			{
				'@type': 'WebPage',
				'@id': `${canonical}#webpage`,
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
			},
			createPublicFaqSEOSchema({
				pageUrl: `${canonical}#faq`,
				name: publicFaqConfigPm.TITLE,
				description: publicFaqConfigPm.DESCRIPTION,
				items: publicFaqItemsVm
			})
		])
	);

	return {
		pageMetaTags,
		isLoggedIn,
		pageVmMonthly,
		pageVmYearly,
		defaultPeriod: monthlyPeriod,
		schemaData,
		publicFaqConfigPm,
		publicFaqItemsVm
	};
}

