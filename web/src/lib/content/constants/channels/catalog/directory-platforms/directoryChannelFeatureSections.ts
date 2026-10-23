import type { PublicChannelFeatureSection } from '$lib/content/constants/channels/catalog/types';
import { PUBLIC_DIRECTORY_SUBMISSION_LANDING_CONFIG } from '$lib/content/constants/marketing/directory-submission-landing';

const SEARCH_CONSOLE_HERO_IMAGE_SRC = '/landing/search-console-performance.webp';

export type DirectoryChannelFeatureSectionsParams = {
	platformLabel: string;
	/** Host shown in Safari chrome (e.g. peerpush.com). */
	siteHost: string;
	/** Platform-specific discovery fields phrase (e.g. "PeerPush categories"). */
	discoveryFieldsLabel: string;
	/** One or two short sentences for the extension autofill bento under feature 1. */
	autofillDescription: string;
};

/**
 * Five-row feature heroes for `/channels/{directory-slug}` — copy tracks
 * `/directory-submission-tool` `productFeatureSections`, with platform-first tailoring.
 */
export function buildDirectoryChannelFeatureSections(
	params: DirectoryChannelFeatureSectionsParams
): PublicChannelFeatureSection[] {
	const { platformLabel, siteHost, discoveryFieldsLabel, autofillDescription } = params;
	const product = PUBLIC_DIRECTORY_SUBMISSION_LANDING_CONFIG.productFeatureSections;

	return [
		{
			subtitle: product.feature1.subtitle,
			title: product.feature1.title,
			description: autofillDescription,
			bentoId: 'directory-extension-autofill',
			mediaOnRight: true
		},
		{
			subtitle: product.feature2.subtitle,
			title: product.feature2.title,
			description:
				`${product.feature2.description} Automate profiles, variants, and listing readiness from your terminal or CI, then use the browser extension when you submit on ${siteHost}.`,
			bentoId: 'directory-workspaces-team',
			mediaOnRight: false
		},
		{
			subtitle: product.feature3.subtitle,
			title: product.feature3.title,
			description:
				`Edit name, description, screenshots, and links in one dashboard. Tailor ${discoveryFieldsLabel} or pricing per site. Changes sync to pending ${platformLabel} launches and other directories. Track real-time progress.`,
			bentoId: 'directory-profile-cases',
			mediaOnRight: false
		},
		{
			subtitle: product.feature4.subtitle,
			title: product.feature4.title,
			description:
				`Monitor domain rating history for your product site, add competitor domains, and see trends next to ${platformLabel} and other listings you submitted in one dashboard — so you know what is working.`,
			bentoId: 'directory-analytics',
			mediaOnRight: true
		},
		{
			subtitle: product.feature5.subtitle,
			title: product.feature5.title,
			description:
				`Search Console totals and trends next to your launches on ${siteHost} and beyond. See when steady directory submits turn into more visits — not just backlinks on a spreadsheet.`,
			imageSrc: SEARCH_CONSOLE_HERO_IMAGE_SRC,
			imageAlt: 'Search Console performance chart showing growing clicks and impressions',
			mediaOnRight: false
		}
	];
}
