import type { MetaTagsProps } from 'svelte-meta-tags';

import { error } from '@sveltejs/kit';

import { publicAgentByPagePresenter } from '$lib/area-public';
import {
	CONFIG_SCHEMA_COMPANY,
} from '$lib/config/constants/config';
import { listPublicAgentChannelsForHub } from '$lib/content/constants/publicAgentChannelConfig';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
import { loadAgentListingsPreviewStateless } from '$lib/listings/server/loadAgentListingsPreview.server';
import { createMetaData } from '$lib/utils/createMetaData';
import { getRootPathPublicAgent } from '$lib/area-public/constants/getRootPathPublicAgents';

export const ssr = true;

function buildSoftwareApplicationSchema(params: {
	canonical: string;
	origin: string;
	docsPath: string;
	name: string;
	description: string;
	keywords: string[];
	featureList: string[];
}) {
	const { canonical, origin, docsPath, name, description, keywords, featureList } = params;

	return {
		'@type': 'SoftwareApplication',
		'@id': `${canonical}#software`,
		name,
		description,
		url: canonical,
		applicationCategory: 'AI assistant',
		operatingSystem: 'Web, Desktop, CLI',
		softwareHelp: new URL(docsPath, origin).href,
		featureList,
		keywords: keywords.join(', '),
		mainEntityOfPage: {
			'@id': `${canonical}#webpage`
		}
	};
}

export async function load({ url, params, cookies, parent, fetch }) {
	const { slug } = params;

	if (typeof slug !== 'string' || slug.trim().length === 0) {
		throw error(404, 'Agent page not found');
	}

	const agentVm = publicAgentByPagePresenter.loadAgentBySlugStateless(slug);
	if (!agentVm) {
		throw error(404, 'Agent page not found');
	}

	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const listingsPreviewVm = await loadAgentListingsPreviewStateless({
		fetch,
		previewSection: agentVm.listingsPreviewSection
	});

	const { companyInformationPm, marketingInformationPm } = await parent();

	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const customTitle = `${agentVm.metaTitle} | ${companyName}`;
	const customDescription = agentVm.metaDescription;

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle,
		customDescription,
		customSlug: getRootPathPublicAgent(agentVm.slug),
		customTags: agentVm.keywords,
		requestUrl: url
	})) satisfies MetaTagsProps;

	const canonical = new URL(url.pathname, url.origin).href;
	const featureList = [
		...agentVm.setupSteps.map((step) => step.title),
		...agentVm.featureSections.map((section) => section.title)
	].filter((value, index, values) => value.trim().length > 0 && values.indexOf(value) === index);
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
				name: agentVm.metaTitle,
				description: customDescription,
				url: canonical,
				mainEntity: {
					'@id': `${canonical}#software`
				},
				isPartOf: {
					'@type': 'WebSite',
					name: companyName,
					url: url.origin
				}
			},
			buildSoftwareApplicationSchema({
				canonical,
				origin: url.origin,
				docsPath: agentVm.docsPath,
				name: agentVm.agentLabel,
				description: customDescription,
				keywords: agentVm.keywords,
				featureList
			}),
			createPublicFaqSEOSchema({
				pageUrl: `${canonical}#faq`,
				name: agentVm.faqTitle,
				description: agentVm.faqDescription,
				items: agentVm.faqItems
			})
		].filter((node) => Object.keys(node).length > 0)
	};

	return {
		pageMetaTags,
		isLoggedIn,
		agentVm,
		listingsPreviewVm,
		schemaData,
		agentChannelLinksVm: listPublicAgentChannelsForHub(agentVm.slug)
	};
}
