import type { MetaTagsProps } from 'svelte-meta-tags';
import type { Link } from '$lib/ui/nav-bars/Link';
import {
	CONFIG_SCHEMA_COMPANY,
	CONFIG_SCHEMA_LANDING_PAGE,
	CONFIG_SCHEMA_MARKETING,
	getLandingPageConfigDefaults,
	getPublicFaqConfigDefaults,
	PUBLIC_NAVBAR_LINKS
} from '$lib/config/constants/config';
import { configRepository } from '$lib/config/Config.repository.svelte';
import { mergeModuleConfigDefaults } from '$lib/config/utils/mergeModuleConfigDefaults';
import { normalizeConfigStringValue } from '$lib/config/utils/normalizeConfigStringValue';
import { LANDING_PAGE_OPPORTUNITIES_PREVIEW_SECTION } from '$lib/content/constants/agents';
import { PUBLIC_LANDING_WHO_IS_FOR_CARDS } from '$lib/content/constants/landing/who-is-for';
import { createLandingDemoSEOSchema } from '$lib/content/utils/createLandingDemoSEOSchema';
import {
	createOrganizationSEOSchema,
	organizationSchemaId
} from '$lib/content/utils/createOrganizationSEOSchema';
import {
	createPublicAudienceSectionSEOSchema,
	withSchemaOrgAudience
} from '$lib/content/utils/createPublicAudienceSEOSchema';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
import { createPublicPricingSectionSEOSchema } from '$lib/content/utils/createPublicPricingSEOSchema';
import { buildPublicHomeLandingFaqItems } from '$lib/content/constants/marketing/publicMarketingLandingFaqs';
import {
	parsePublicFaqConfigModule,
	resolvePublicFaqItemsVm
} from '$lib/content/utils/parsePublicFaqConfig';
import { loadAgentOpportunitiesPreviewStateless } from '$lib/opportunities/server/loadAgentOpportunitiesPreview.server';
import { buildCanonicalUrl } from '$lib/seo/buildCanonicalUrl';
import { PUBLIC_LANDING_SEO_KEYWORDS } from '$lib/seo/constants/publicLandingSeoKeywords';
import { createMetaData, openGraphForPublicPage } from '$lib/seo/createMetaData';
import {
	createJsonLdGraph,
	filterNonEmptyJsonLdNodes,
	type JsonLdGraphNode
} from '$lib/seo/jsonLdSchema';
export async function loadMergedLandingPageConfigVm(
	fetch: typeof globalThis.fetch
): Promise<Record<string, string>> {
	const landingPageRaw = await loadPublicModuleConfig('landing_page', fetch);
	return mergeModuleConfigDefaults(getLandingPageConfigDefaults(), landingPageRaw);
}

async function loadPublicModuleConfig(
	moduleName: string,
	fetch: typeof globalThis.fetch
): Promise<Record<string, unknown> | null> {
	try {
		const loaded = await configRepository.getPublicModuleConfig(moduleName, fetch);
		return Object.keys(loaded).length > 0 ? loaded : null;
	} catch (error) {
		console.error(`[loadPublicCmsLandingPage] Failed to fetch ${moduleName} config:`, error);
		return null;
	}
}

export type LoadPublicCmsLandingPageParams = {
	url: URL;
	fetch: typeof globalThis.fetch;
	baseMetaTags: MetaTagsProps;
	companyInformationPm: { config?: Record<string, unknown> } | null;
	marketingInformationPm: { config?: Record<string, unknown> } | null;
	footerNavigationLinks: Record<string, { label: string; href: string }[]>;
	/** When true, emit `WebSite` at `{origin}/#website` (home only). */
	includeWebSiteSchema?: boolean;
	/** Extra JSON-LD nodes (e.g. breadcrumbs) merged before filtering. */
	extraSchemaNodes?: readonly JsonLdGraphNode[];
	/** Route-specific hero copy (overrides CMS `landing_page` HERO_* for this URL only). */
	landingPageHero?: { title: string; slogan: string };
	/** Route-specific `<title>` / meta description (single-line title, no `| company`). */
	pageSeo?: {
		metaTitle: string;
		metaDescription: string;
		keywords?: readonly string[];
	};
};

export async function loadPublicCmsLandingPage(params: LoadPublicCmsLandingPageParams) {
	const {
		url,
		fetch,
		baseMetaTags,
		companyInformationPm,
		marketingInformationPm,
		footerNavigationLinks,
		includeWebSiteSchema = false,
		extraSchemaNodes = [],
		landingPageHero,
		pageSeo
	} = params;

	const navbarDesktopLinks: Link[] = [...PUBLIC_NAVBAR_LINKS];
	const navbarMobileLinks: Link[] = [...PUBLIC_NAVBAR_LINKS];

	const [landingPageConfigVm, publicFaqRaw] = await Promise.all([
		loadMergedLandingPageConfigVm(fetch),
		loadPublicModuleConfig('public_faq', fetch)
	]);

	let mergedLandingPageConfigVm = landingPageConfigVm;

	if (landingPageHero) {
		mergedLandingPageConfigVm = {
			...mergedLandingPageConfigVm,
			HERO_TITLE: landingPageHero.title,
			HERO_SLOGAN: landingPageHero.slogan
		};
	}

	const { configVm: publicFaqConfigVm, itemsVm: parsedPublicFaqItemsVm } =
		parsePublicFaqConfigModule(publicFaqRaw);
	const publicFaqItemsVm = buildPublicHomeLandingFaqItems(
		resolvePublicFaqItemsVm(parsedPublicFaqItemsVm)
	);
	const publicFaqDefaults = getPublicFaqConfigDefaults();

	const opportunitiesPreviewVm = await loadAgentOpportunitiesPreviewStateless({
		fetch,
		previewSection: LANDING_PAGE_OPPORTUNITIES_PREVIEW_SECTION
	});

	const companyName =
		(typeof companyInformationPm?.config?.NAME === 'string' && companyInformationPm.config.NAME) ||
		String(CONFIG_SCHEMA_COMPANY.NAME.default);
	const companyUrl =
		(typeof companyInformationPm?.config?.URL === 'string' && companyInformationPm.config.URL) ||
		String(CONFIG_SCHEMA_COMPANY.URL.default);
	const heroTitleRaw =
		mergedLandingPageConfigVm.HERO_TITLE ?? String(CONFIG_SCHEMA_MARKETING.META_TITLE.default);
	const heroDescription =
		mergedLandingPageConfigVm.HERO_SLOGAN ?? String(CONFIG_SCHEMA_MARKETING.META_DESCRIPTION.default);
	const customTitle = pageSeo
		? pageSeo.metaTitle.trim()
		: normalizeConfigStringValue(heroTitleRaw).replace(/\n+/g, ' ').trim();
	const metaDescription = pageSeo?.metaDescription ?? heroDescription;

	const metaTags = await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${customTitle} | ${companyName}`,
		customDescription: metaDescription,
		customTags: [...(pageSeo?.keywords ?? PUBLIC_LANDING_SEO_KEYWORDS)],
		requestUrl: url
	});

	const canonical = buildCanonicalUrl(url);
	const og = openGraphForPublicPage(customTitle, metaDescription, canonical);

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

	const audienceSectionTitle =
		mergedLandingPageConfigVm.AUDIENCE_TITLE ??
		String(CONFIG_SCHEMA_LANDING_PAGE.AUDIENCE_TITLE.default);
	const audienceSectionSubtitle =
		mergedLandingPageConfigVm.AUDIENCE_SUBTITLE ??
		String(CONFIG_SCHEMA_LANDING_PAGE.AUDIENCE_SUBTITLE.default);
	const audienceSectionCopy = {
		sectionTitle: audienceSectionTitle,
		sectionSubtitle: audienceSectionSubtitle,
		cards: PUBLIC_LANDING_WHO_IS_FOR_CARDS
	};

	const webSiteNode: JsonLdGraphNode | null = includeWebSiteSchema
		? {
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
			}
		: null;

	const schemaData = createJsonLdGraph(
		filterNonEmptyJsonLdNodes([
			...(webSiteNode ? [webSiteNode] : []),
			{
				'@type': 'WebPage',
				'@id': `${canonical}#webpage`,
				name: customTitle,
				description: metaDescription,
				url: canonical,
				isPartOf: {
					'@type': 'WebSite',
					name: companyName,
					url: url.origin
				}
			},
			withSchemaOrgAudience(
				{
					'@type': 'SoftwareApplication',
					'@id': `${canonical}#software`,
					name: companyName,
					alternateName: 'openquok',
					description: metaDescription,
					url: canonical,
					applicationCategory: 'BusinessApplication',
					operatingSystem: 'Web',
					publisher: { '@id': organizationId },
					mainEntityOfPage: {
						'@id': `${canonical}#webpage`
					}
				},
				audienceSectionCopy,
				canonical
			),
			createPublicAudienceSectionSEOSchema({
				pageUrl: canonical,
				...audienceSectionCopy
			}),
			organization,
			createPublicFaqSEOSchema({
				pageUrl: `${canonical}#faq`,
				name:
					mergedLandingPageConfigVm.FAQ_TITLE ??
					publicFaqConfigVm.TITLE ??
					publicFaqDefaults.TITLE,
				description:
					mergedLandingPageConfigVm.FAQ_DESCRIPTION ??
					publicFaqConfigVm.DESCRIPTION ??
					publicFaqDefaults.DESCRIPTION,
				items: publicFaqItemsVm
			}),
			createLandingDemoSEOSchema({
				youtubeVideoId: mergedLandingPageConfigVm.DEMO_YOUTUBE_VIDEO_ID,
				name: mergedLandingPageConfigVm.DEMO_TITLE,
				description: mergedLandingPageConfigVm.DEMO_DESCRIPTION,
				pageUrl: canonical,
				uploadDate: mergedLandingPageConfigVm.DEMO_YOUTUBE_UPLOAD_DATE
			}),
			createPublicPricingSectionSEOSchema({
				pageUrl: canonical,
				origin: url.origin
			}),
			...extraSchemaNodes
		])
	);

	return {
		pageMetaTags,
		navbarDesktopLinks,
		navbarMobileLinks,
		footerNavigationLinks,
		landingPageConfigVm: mergedLandingPageConfigVm,
		publicFaqConfigVm,
		publicFaqItemsVm,
		opportunitiesPreviewVm,
		schemaData
	};
}
