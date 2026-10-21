import type { MetaTagsProps } from 'svelte-meta-tags';
import type { SubscriptionPeriod } from 'openquok-common';

import { redirect } from '@sveltejs/kit';

import { GetPublicPricingPresenter } from '$lib/billing';
import {
	publicPricingPageSeoForRouteId,
	publicPricingRedirectPathForLineQuery,
	type PublicPricingRouteId
} from '$lib/billing/constants/publicPricingPageSeo';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { configRepository } from '$lib/config/Config.repository.svelte';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
import { createPublicPricingOffers } from '$lib/content/utils/createPublicPricingSEOSchema';
import { getPublicPricingFaqItems } from '$lib/content/constants/faq';
import { parsePublicFaqConfigModule } from '$lib/content/utils/parsePublicFaqConfig';
import { buildPricingLandingBreadcrumbItems } from '$lib/content/utils/buildPublicLandingBreadcrumbItems';
import { createMetaData } from '$lib/seo/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/seo/buildCanonicalUrl';
import { createBreadcrumbListSchema } from '$lib/seo/buildPublicLandingBreadcrumbJsonLd';
import { createJsonLdGraph, filterNonEmptyJsonLdNodes } from '$lib/seo/jsonLdSchema';

type LoadPublicPricingPageParams = {
	url: URL;
	cookies: { get: (name: string) => string | undefined };
	parent: () => Promise<Record<string, unknown>>;
	routeId: PublicPricingRouteId;
	/** When true, redirect legacy `?line=social|directory` to dedicated routes (hub only). */
	redirectLegacyLineQuery?: boolean;
};

export async function loadPublicPricingPage({
	url,
	cookies,
	parent,
	routeId,
	redirectLegacyLineQuery = false
}: LoadPublicPricingPageParams) {
	if (redirectLegacyLineQuery) {
		const legacyTarget = publicPricingRedirectPathForLineQuery(url.searchParams.get('line'));
		if (legacyTarget) {
			const hash = url.hash ?? '';
			redirect(308, `${legacyTarget}${hash}`);
		}
	}

	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformationPm, marketingInformationPm } = await parent();

	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const seo = publicPricingPageSeoForRouteId(routeId);

	let publicFaqRaw: Record<string, unknown> | null = null;
	try {
		const loaded = await configRepository.getPublicModuleConfig('public_faq');
		if (Object.keys(loaded).length > 0) {
			publicFaqRaw = loaded;
		}
	} catch (error) {
		console.error('[pricing] Failed to fetch public FAQ config:', error);
	}

	const { configVm: publicFaqConfigPm } = parsePublicFaqConfigModule(publicFaqRaw);
	const publicFaqItemsVm = getPublicPricingFaqItems();

	const customSlug = seo.pathSegment ? `pricing/${seo.pathSegment}` : 'pricing';

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${seo.metaTitle} | ${companyName}`,
		customDescription: seo.metaDescription,
		customSlug,
		customTags: [...seo.keywords],
		requestUrl: url
	})) satisfies MetaTagsProps;

	const canonical = buildCanonicalUrl(url);
	const pageMetaTags = withCanonicalMetaTags(metaTags, canonical, {
		openGraph: {
			title: seo.metaTitle,
			description: seo.metaDescription
		},
		twitter: {
			title: seo.metaTitle,
			description: seo.metaDescription
		}
	});

	const presenter = new GetPublicPricingPresenter();
	const productLine = seo.productLine;

	const monthlyPeriod: SubscriptionPeriod = 'MONTHLY';
	const yearlyPeriod: SubscriptionPeriod = 'YEARLY';
	const pageVmMonthly = presenter.buildPageVm(monthlyPeriod, productLine);
	const pageVmYearly = presenter.buildPageVm(yearlyPeriod, productLine);
	const pricingOffers = createPublicPricingOffers({
		pageUrl: canonical,
		origin: url.origin,
		period: monthlyPeriod
	});

	const schemaData = createJsonLdGraph(
		filterNonEmptyJsonLdNodes([
			{
				'@type': 'WebPage',
				'@id': `${canonical}#webpage`,
				name: seo.metaTitle,
				description: seo.metaDescription,
				url: canonical,
				isPartOf: {
					'@type': 'WebSite',
					name: companyName,
					url: url.origin
				},
				offers: pricingOffers
			},
			createPublicFaqSEOSchema({
				pageUrl: `${canonical}#faq`,
				name: publicFaqConfigPm.TITLE,
				description: publicFaqConfigPm.DESCRIPTION,
				items: publicFaqItemsVm
			}),
			createBreadcrumbListSchema(buildPricingLandingBreadcrumbItems(), url.origin)
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
		publicFaqItemsVm,
		pricingRouteId: routeId,
		productLine,
		pricingHero: seo.hero,
		pricingBreadcrumbLabel: seo.breadcrumbLabel
	};
}
