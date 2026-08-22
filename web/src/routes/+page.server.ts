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
import { mergeModuleConfigDefaults } from '$lib/config/utils/mergeModuleConfigDefaults';
import { normalizeConfigStringValue } from '$lib/config/utils/normalizeConfigStringValue';
import { createLandingDemoSEOSchema } from '$lib/content/utils/createLandingDemoSEOSchema';
import {
	createOrganizationSEOSchema,
	organizationSchemaId
} from '$lib/content/utils/createOrganizationSEOSchema';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
import { parsePublicFaqConfigModule } from '$lib/content/utils/parsePublicFaqConfig';
import { createMetaData, openGraphForPublicPage } from '$lib/seo/createMetaData';
import { buildCanonicalUrl } from '$lib/seo/buildCanonicalUrl';
import { createJsonLdGraph, filterNonEmptyJsonLdNodes } from '$lib/seo/jsonLdSchema';
import { LANDING_PAGE_LISTINGS_PREVIEW_SECTION } from '$lib/content/constants/publicAgentConfig';
import { loadAgentListingsPreviewStateless } from '$lib/listings/server/loadAgentListingsPreview.server';

export const ssr = true;

/** Public module config for SSR copy; `null` when unset so git-managed defaults win. */
async function loadPublicModuleConfig(
	moduleName: string,
	fetch: typeof globalThis.fetch
): Promise<Record<string, unknown> | null> {
	try {
		const loaded = await configRepository.getPublicModuleConfig(moduleName, fetch);
		return Object.keys(loaded).length > 0 ? loaded : null;
	} catch (error) {
		console.error(`[+page.server] Failed to fetch ${moduleName} config:`, error);
		return null;
	}
}

export const load: PageServerLoad = async ({ parent, url, fetch }) => {
	const { baseMetaTags, companyInformationPm, marketingInformationPm } = await parent();

	const navbarDesktopLinks: Link[] = [...PUBLIC_NAVBAR_LINKS];
	const navbarMobileLinks: Link[] = [...PUBLIC_NAVBAR_LINKS];
	const footerNavigationLinks = { ...PUBLIC_FOOTER_LINKS };

	const [landingPageRaw, publicFaqRaw] = await Promise.all([
		loadPublicModuleConfig('landing_page', fetch),
		loadPublicModuleConfig('public_faq', fetch)
	]);

	const landingPageConfigVm = mergeModuleConfigDefaults(
		getLandingPageConfigDefaults(),
		landingPageRaw
	);

	const { configVm: publicFaqConfigVm, itemsVm: publicFaqItemsVm } =
		parsePublicFaqConfigModule(publicFaqRaw);
	const publicFaqDefaults = getPublicFaqConfigDefaults();

	const listingsPreviewVm = await loadAgentListingsPreviewStateless({
		fetch,
		previewSection: LANDING_PAGE_LISTINGS_PREVIEW_SECTION
	});

	const companyName =
		(typeof companyInformationPm?.config?.NAME === 'string' && companyInformationPm.config.NAME) ||
		String(CONFIG_SCHEMA_COMPANY.NAME.default);
	const companyUrl =
		(typeof companyInformationPm?.config?.URL === 'string' && companyInformationPm.config.URL) ||
		String(CONFIG_SCHEMA_COMPANY.URL.default);
	const heroTitleRaw =
		landingPageConfigVm.HERO_TITLE ?? String(CONFIG_SCHEMA_MARKETING.META_TITLE.default);
	const heroDescription =
		landingPageConfigVm.HERO_SLOGAN ?? String(CONFIG_SCHEMA_MARKETING.META_DESCRIPTION.default);
	const customTitle = normalizeConfigStringValue(heroTitleRaw).replace(/\n+/g, ' ').trim();

	const metaTags = await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${customTitle} | ${companyName}`,
		customDescription: heroDescription,
		customTags: [
			'social media scheduler',
			'social media scheduling tool',
			'schedule social media posts',
			'social media scheduler free',
			'post scheduler',
			'social media posting tool',
			'social media planning tool'
		],
		requestUrl: url
	});

	const canonical = buildCanonicalUrl(url);
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

	const organizationId = organizationSchemaId(url.origin);
	const organization = createOrganizationSEOSchema({
		name: companyName,
		url: companyUrl,
		origin: url.origin,
		logo: new URL('/pwa/favicon.svg', url.origin).href
	});

	const schemaData = createJsonLdGraph(
		filterNonEmptyJsonLdNodes([
			{
				'@type': 'WebSite',
				'@id': `${url.origin}/#website`,
				name: companyName,
				url: url.origin,
				description: heroDescription,
				publisher: { '@id': organizationId },
				potentialAction: {
					'@type': 'SearchAction',
					target: `${url.origin}/blog?q={search_term_string}`,
					'query-input': 'required name=search_term_string'
				}
			},
			{
				'@type': 'SoftwareApplication',
				'@id': `${canonical}#software`,
				name: companyName,
				alternateName: 'openquok',
				description: heroDescription,
				url: canonical,
				applicationCategory: 'BusinessApplication',
				operatingSystem: 'Web',
				publisher: { '@id': organizationId }
			},
			organization,
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
				youtubeVideoId: landingPageConfigVm.DEMO_YOUTUBE_VIDEO_ID,
				name: landingPageConfigVm.DEMO_TITLE,
				description: landingPageConfigVm.DEMO_DESCRIPTION,
				pageUrl: canonical,
				uploadDate: landingPageConfigVm.DEMO_YOUTUBE_UPLOAD_DATE
			})
		])
	);

	return {
		pageMetaTags,
		navbarDesktopLinks,
		navbarMobileLinks,
		footerNavigationLinks,
		landingPageConfigVm,
		publicFaqConfigVm,
		publicFaqItemsVm,
		listingsPreviewVm,
		schemaData
	};
};
