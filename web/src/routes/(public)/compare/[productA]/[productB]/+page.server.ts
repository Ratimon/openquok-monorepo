import type { MetaTagsProps } from 'svelte-meta-tags';

import { error } from '@sveltejs/kit';

import { publicComparePagePresenter } from '$lib/area-public';
import { getRootPathPublicComparePair } from '$lib/area-public/constants/getRootPathPublicCompare';
import {
	CONFIG_SCHEMA_COMPANY,
	getPublicFaqConfigDefaults
} from '$lib/config/constants/config';
import { getComparePair } from '$lib/content/constants/publicCompareConfig';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
import { createMetaData } from '$lib/utils/createMetaData';

export const ssr = true;

export async function load({ url, params, cookies, parent }) {
	const productA = params.productA?.trim().toLowerCase() ?? '';
	const productB = params.productB?.trim().toLowerCase() ?? '';

	if (!productA || !productB) {
		throw error(404, 'Comparison page not found');
	}

	const pair = getComparePair(productA, productB);
	if (!pair) {
		throw error(404, 'Comparison page not found');
	}

	const detailVm = publicComparePagePresenter.buildDetailVm(pair);
	if (!detailVm) {
		throw error(404, 'Comparison page not found');
	}

	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;
	const faqDefaults = getPublicFaqConfigDefaults();

	const customTitle = `${detailVm.metaTitle} | ${companyName}`;
	const customDescription = detailVm.metaDescription;

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle,
		customDescription,
		customSlug: getRootPathPublicComparePair(pair.productASlug, pair.productBSlug),
		customTags: detailVm.keywords,
		requestUrl: url
	})) satisfies MetaTagsProps;

	const canonical = new URL(url.pathname, url.origin).href;
	const pageMetaTags = Object.freeze({
		canonical,
		openGraph: {
			title: customTitle,
			description: customDescription
		},
		twitter: {
			title: customTitle,
			description: customDescription
		},
		...metaTags
	}) satisfies MetaTagsProps;

	const schemaData = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'WebPage',
				'@id': `${canonical}#webpage`,
				name: detailVm.metaTitle,
				description: customDescription,
				url: canonical,
				isPartOf: {
					'@type': 'WebSite',
					name: companyName,
					url: url.origin
				}
			},
			createPublicFaqSEOSchema({
				pageUrl: `${canonical}#faq`,
				name: faqDefaults.TITLE,
				description: faqDefaults.DESCRIPTION,
				items: detailVm.faqItems
			})
		].filter((node) => Object.keys(node).length > 0)
	};

	return {
		pageMetaTags,
		isLoggedIn,
		detailVm,
		schemaData
	};
}
