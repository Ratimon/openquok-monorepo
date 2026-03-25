import type { MetaTagsProps, MetaTag } from 'svelte-meta-tags';
import type {
	CompanyInformationProgrammerModel,
	MarketingInformationProgrammerModel
} from '$lib/area-public/PublicInformation.repository.svelte';
import { version } from '$app/environment';

// Re-export for consumers that use local MetaTagsProps
export type { MetaTagsProps } from 'svelte-meta-tags';

// Values from web-config.json (alias in svelte.config.js)
import webConfig from 'web-config';
const { themeColor, appleStatusBarStyle } = webConfig as { themeColor?: string; appleStatusBarStyle?: string };

export type MetaDataImage = {
	url: string;
	type: string;
	alt: string;
	width: number;
	height: number;
};

const DEFAULT_ORIGIN = 'https://openquok.com';
const DEFAULT_NAME = 'Openquok';
const DEFAULT_META_TITLE = 'Openquok';
const DEFAULT_META_DESCRIPTION = 'Openquok web application';
const DEFAULT_META_KEYWORDS = 'openquok, cms, content platform';

/**
 * Creates metadata for a web page. If no custom values are provided, uses company/marketing config or defaults.
 * @param customTitle - Override page title.
 * @param customDescription - Override page description.
 * @param customTags - Override keywords (replaces META_KEYWORDS).
 * @param customImages - Override OpenGraph/Twitter images.
 * @param customSlug - Path segment for canonical/OG URL (e.g. "terms").
 * @param customMetaTags - Extra meta tags appended to additionalMetaTags.
 * @param requestUrl - URL from SvelteKit load for SSR fallbacks.
 */
export async function createMetaData({
	companyInformation,
	marketingInformation,
	customTitle,
	customDescription,
	customTags,
	customImages,
	customSlug,
	customMetaTags,
	requestUrl
}: {
	companyInformation: CompanyInformationProgrammerModel | null;
	marketingInformation: MarketingInformationProgrammerModel | null;
	customTitle?: string;
	customDescription?: string;
	customTags?: string[];
	customImages?: MetaDataImage[];
	customSlug?: string;
	customMetaTags?: MetaTag[];
	requestUrl?: URL;
}): Promise<MetaTagsProps> {
	const companyConfig = companyInformation?.config as Record<string, string> | undefined;
	const marketingConfig = marketingInformation?.config as Record<string, string> | undefined;

	const getDefaultUrl = () => {
		if (requestUrl) return requestUrl.origin;
		if (typeof window !== 'undefined') return window.location.origin;
		return DEFAULT_ORIGIN;
	};

	const defaultCompanyConfig = {
		NAME: DEFAULT_NAME,
		URL: getDefaultUrl()
	};

	const defaultMarketingConfig = {
		META_TITLE: DEFAULT_META_TITLE,
		META_DESCRIPTION: DEFAULT_META_DESCRIPTION,
		META_KEYWORDS: DEFAULT_META_KEYWORDS
	};

	const finalCompanyConfig = companyConfig ?? defaultCompanyConfig;
	const finalMarketingConfig = marketingConfig ?? defaultMarketingConfig;

	let websiteOrigin = getDefaultUrl();
	if (websiteOrigin.startsWith('http://')) {
		websiteOrigin = websiteOrigin.replace('http://', 'https://');
	} else if (!websiteOrigin.startsWith('https://') && !websiteOrigin.startsWith('http://')) {
		websiteOrigin = `https://${websiteOrigin}`;
	}

	let canonicalBaseUrl = finalCompanyConfig.URL ?? websiteOrigin;
	if (
		!canonicalBaseUrl ||
		(!canonicalBaseUrl.startsWith('http://') && !canonicalBaseUrl.startsWith('https://')) ||
		canonicalBaseUrl.includes('s3.amazonaws.com') ||
		canonicalBaseUrl.includes('s3.') ||
		canonicalBaseUrl.includes('.amazonaws.com')
	) {
		canonicalBaseUrl = websiteOrigin;
	}

	const baseUrl = websiteOrigin;
	const companyName = finalCompanyConfig.NAME ?? DEFAULT_NAME;

	if (!companyConfig || !marketingConfig) {
		console.warn('[createMetaData] Missing configurations, using defaults', {
			hasCompanyConfig: !!companyConfig,
			hasMarketingConfig: !!marketingConfig,
			usingBaseUrl: baseUrl
		});
	}

	const cleanCustomTitle = customTitle
		? (() => {
				const pattern = new RegExp(
					`\\s*\\|\\s*${companyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s*\\|\\s*${companyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})*\\s*$`,
					'g'
				);
				return customTitle.replace(pattern, '').trim();
			})()
		: undefined;

	const title = cleanCustomTitle ?? finalMarketingConfig.META_TITLE ?? DEFAULT_META_TITLE;
	const description =
		customDescription ?? finalMarketingConfig.META_DESCRIPTION ?? DEFAULT_META_DESCRIPTION;

	const rawKeywords = finalMarketingConfig.META_KEYWORDS;
	const keywords: string[] = customTags ??
		(Array.isArray(rawKeywords) ? [...rawKeywords] : rawKeywords?.split(',').map((k) => k.trim()) ?? []);

	const canonicalHref =
		requestUrl && !customSlug
			? requestUrl.href
			: customSlug
				? `${canonicalBaseUrl.replace(/\/$/, '')}/${customSlug}`
				: canonicalBaseUrl ?? (typeof window !== 'undefined' ? window.location.href : DEFAULT_ORIGIN);

	const defaultOgImages: MetaDataImage[] = [
		{ url: `${baseUrl}/og/og_1200x630.png`, type: 'image', alt: `${companyName} OG 1200x630`, width: 1200, height: 630 },
		{ url: `${baseUrl}/og/og_1080x1080.png`, type: 'image', alt: `${companyName} OG 1080x1080`, width: 1080, height: 1080 },
		{ url: `${baseUrl}/og/og_1600x900.png`, type: 'image', alt: `${companyName} OG 1600x900`, width: 1600, height: 900 }
	];
	const ogImages = customImages ?? defaultOgImages;

	return {
		title,
		titleTemplate: `%s | ${companyName}`,
		description,
		canonical: canonicalHref,
		keywords,

		openGraph: {
			url: customSlug ? `${canonicalBaseUrl}/${customSlug}` : canonicalBaseUrl,
			type: 'website',
			locale: 'en_US',
			siteName: companyName,
			title,
			description,
			images: ogImages
		},

		twitter: {
			cardType: 'summary_large_image',
			title,
			description,
			image: ogImages[0]?.url ?? `${baseUrl}/og/og_1600x900.png`
		},

		additionalMetaTags: [
			{ name: 'theme-color', content: themeColor ?? '#34A7D6' },
			{ name: 'mobile-web-app-capable', content: 'yes' },
			{ name: 'application-name', content: companyName },
			{ name: 'apple-mobile-web-app-capable', content: 'yes' },
			{ name: 'apple-mobile-web-app-status-bar-style', content: appleStatusBarStyle ?? 'default' },
			{ name: 'apple-mobile-web-app-title', content: companyName },
			{ name: 'version', content: version },
			{ property: 'twitter:url', content: customSlug ? `${canonicalBaseUrl}/${customSlug}` : canonicalBaseUrl },
			...(customMetaTags ?? [])
		],

		additionalLinkTags: [
			{ rel: 'icon', href: '/favicon.ico', type: 'image/x-icon' },
			{ rel: 'shortcut icon', href: '/favicon.ico', type: 'image/x-icon' },
			{ rel: 'icon', href: '/pwa/favicon.svg', type: 'image/svg+xml' },
			{ rel: 'icon', href: '/pwa/favicon-192.png', type: 'image/png', sizes: '192x192' },
			{ rel: 'icon', href: '/pwa/favicon-512.png', type: 'image/png', sizes: '512x512' },
			{ rel: 'icon', href: '/pwa/favicon.ico', sizes: 'any' },
			{ rel: 'apple-touch-icon', href: '/pwa/apple-touch-icon.png' },
			{ rel: 'manifest', href: '/pwa/manifest.webmanifest' }
		]
	};
}
