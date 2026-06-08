import type { PageServerLoad } from './$types';
import type { MetaTagsProps } from 'svelte-meta-tags';
import type { Link } from '$lib/ui/nav-bars/Link';

import {
	CONFIG_SCHEMA_COMPANY,
	CONFIG_SCHEMA_MARKETING,
	getLandingPageConfigDefaults,
	getPublicFaqConfigDefaults,
	PUBLIC_FOOTER_LINKS,
	PUBLIC_NAVBAR_LINKS
} from '$lib/config/constants/config';
import { configRepository } from '$lib/config/Config.repository.svelte';
import { getCompanyNameFromPm, getCompanyUrlFromPm } from '$lib/config/utils/getCompanyDisplayNames';
import { normalizeConfigStringValue } from '$lib/config/utils/normalizeConfigStringValue';
import { createLandingDemoSEOSchema } from '$lib/content/utils/createLandingDemoSEOSchema';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
import { parsePublicFaqConfigModule } from '$lib/content/utils/parsePublicFaqConfig';
import { createMetaData, openGraphForPublicPage } from '$lib/utils/createMetaData';

export const ssr = true;

export const load: PageServerLoad = async ({ parent, url }) => {
	const { baseMetaTags, companyInformationPm, marketingInformationPm } = await parent();

	const navbarDesktopLinks: Link[] = [...PUBLIC_NAVBAR_LINKS];
	const navbarMobileLinks: Link[] = [...PUBLIC_NAVBAR_LINKS];
	const footerNavigationLinks = { ...PUBLIC_FOOTER_LINKS };

	const landingDefaults = getLandingPageConfigDefaults();
	let landingPageConfigVm: Record<string, string> = landingDefaults;

	try {
		const loaded = await configRepository.getPublicModuleConfig('landing_page');
		if (Object.keys(loaded).length > 0) {
			const normalizedLoaded = Object.fromEntries(
				Object.entries(loaded).map(([key, value]) => [
					key,
					value == null ? '' : normalizeConfigStringValue(String(value))
				])
			) as Record<string, string>;
			landingPageConfigVm = { ...landingDefaults, ...normalizedLoaded };
		}
	} catch (error) {
		console.error('[+page.server] Failed to fetch landing page config:', error);
	}

	let publicFaqRaw: Record<string, unknown> | null = null;
	try {
		const loaded = await configRepository.getPublicModuleConfig('public_faq');
		if (Object.keys(loaded).length > 0) {
			publicFaqRaw = loaded;
		}
	} catch (error) {
		console.error('[+page.server] Failed to fetch public FAQ config:', error);
	}

	const { configVm: publicFaqConfigVm, itemsVm: publicFaqItemsVm } =
		parsePublicFaqConfigModule(publicFaqRaw);
	const publicFaqDefaults = getPublicFaqConfigDefaults();

	const companyName =
		companyInformationPm?.config?.NAME ?? String(CONFIG_SCHEMA_COMPANY.NAME.default);
	const companyLegalName = getCompanyNameFromPm(companyInformationPm);
	const companyUrl = getCompanyUrlFromPm(companyInformationPm);
	const heroTitleRaw =
		landingPageConfigVm.HERO_TITLE ?? landingDefaults.HERO_TITLE ?? String(CONFIG_SCHEMA_MARKETING.META_TITLE.default);
	const heroDescription =
		landingPageConfigVm.HERO_SLOGAN ??
		landingDefaults.HERO_SLOGAN ??
		String(CONFIG_SCHEMA_MARKETING.META_DESCRIPTION.default);
	const customTitle = normalizeConfigStringValue(heroTitleRaw).replace(/\n+/g, ' ').trim();

	const metaTags = await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${customTitle} | ${companyName}`,
		customDescription: heroDescription,
		requestUrl: url
	});

	const canonical = new URL(url.pathname, url.origin).href;
	const og = openGraphForPublicPage(customTitle, heroDescription, canonical);

	const pageMetaTags = Object.freeze({
		...baseMetaTags,
		...metaTags,
		canonical,
		titleTemplate: '%s',
		openGraph: {
			...metaTags.openGraph,
			...og.openGraph
		},
		twitter: {
			...metaTags.twitter,
			...og.twitter
		}
	}) satisfies MetaTagsProps;

	const schemaData = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'Organization',
				'@id': `${url.origin}/#organization`,
				name: companyLegalName,
				url: companyUrl,
				logo: `${url.origin}/pwa/favicon.svg`
			},
			{
				'@type': 'WebSite',
				'@id': `${url.origin}/#website`,
				name: companyName,
				url: url.origin,
				description: heroDescription,
				publisher: { '@id': `${url.origin}/#organization` },
				potentialAction: {
					'@type': 'SearchAction',
					target: `${url.origin}/blog?q={search_term_string}`,
					'query-input': 'required name=search_term_string'
				}
			},
			createPublicFaqSEOSchema({
				pageUrl: `${canonical}#faq`,
				name:
					landingPageConfigVm.FAQ_TITLE ??
					publicFaqConfigVm.TITLE ??
					publicFaqDefaults.TITLE,
				description:
					landingPageConfigVm.FAQ_DESCRIPTION ??
					publicFaqConfigVm.DESCRIPTION ??
					publicFaqDefaults.DESCRIPTION,
				items: publicFaqItemsVm
			}),
			createLandingDemoSEOSchema({
				youtubeVideoId:
					landingPageConfigVm.DEMO_YOUTUBE_VIDEO_ID ?? landingDefaults.DEMO_YOUTUBE_VIDEO_ID,
				name: landingPageConfigVm.DEMO_TITLE ?? landingDefaults.DEMO_TITLE,
				description: landingPageConfigVm.DEMO_DESCRIPTION ?? landingDefaults.DEMO_DESCRIPTION,
				pageUrl: canonical
			})
		].filter((node) => Object.keys(node).length > 0)
	};

	return {
		pageMetaTags,
		navbarDesktopLinks,
		navbarMobileLinks,
		footerNavigationLinks,
		landingPageConfigVm,
		publicFaqConfigVm,
		publicFaqItemsVm,
		schemaData
	};
};
