import type { IconName } from '$data/icons';

import type { PublicFaqItem } from '$lib/content/constants/publicFaqConfig';

export type PublicApiCapability = 'posting' | 'scheduling';

export type PublicApiPlatformSlug =
	| 'tiktok'
	| 'x'
	| 'instagram'
	| 'youtube'
	| 'facebook'
	| 'threads'
	| 'linkedin';

/** Tabbed static request/response pair on platform slug pages. */
export type PublicApiFormatExample = {
	id: string;
	label: string;
	description: string;
	requestJson: string;
	responseJson: string;
	/** Agent skill example filename when derived from shipped JSON. */
	sourceFile?: string;
};

export type PublicApiHubStaticExample = {
	curl: string;
	requestJson: string;
	responseJson: string;
	endpoint: string;
	method: 'POST';
};

export type PublicApiHubPageViewModel = {
	capability: PublicApiCapability;
	heroTitle: string;
	heroDescription: string;
	metaTitle: string;
	metaDescription: string;
	keywords: readonly string[];
	hubDescription: string;
	staticExample: PublicApiHubStaticExample;
	faqSubtitle: string;
	faqTitle: string;
	faqDescription: string;
	faqItems: readonly PublicFaqItem[];
};

export type PublicApiPlatformHubCard = {
	slug: PublicApiPlatformSlug;
	platformLabel: string;
	icon: IconName;
	hubDescription: string;
};

export type PublicApiPlatformPageViewModel = {
	capability: PublicApiCapability;
	slug: PublicApiPlatformSlug;
	/** Integration catalog identifier for Payload Wizard focus and docs links. */
	providerIdentifier: string;
	platformLabel: string;
	icon: IconName;
	docsPath: string;
	publicApiProvidersDocsPath: string;
	heroTitle: string;
	heroDescription: string;
	metaTitle: string;
	metaDescription: string;
	keywords: readonly string[];
	formatExamples: readonly PublicApiFormatExample[];
	faqSubtitle: string;
	faqTitle: string;
	faqDescription: string;
	faqItems: readonly PublicFaqItem[];
};
