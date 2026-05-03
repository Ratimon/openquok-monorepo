import type { MetaTagsProps } from 'svelte-meta-tags';

import { getRootPathPublicBlog } from '$lib/area-public/constants/getRootPathPublicBlog';
import { publicBlogTopicBySlugPagePresenter, publicInformationRepository } from '$lib/area-public/index';
import { createMetaData } from '$lib/utils/createMetaData';

export const ssr = true;

export async function load({ url, params, fetch, cookies }) {
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const topicSlug = typeof params.slug === 'string' ? params.slug : '';

	const { companyInformation: companyInformationPm, marketingInformation: marketingInformationPm } =
		await publicInformationRepository.getAllInformationCombined(fetch);

	const { CONFIG_SCHEMA_COMPANY, CONFIG_SCHEMA_MARKETING } = await import('$lib/config/constants/config');
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const rawPage = url.searchParams.get('page');
	const pageSanitized = rawPage?.replace(/\D/g, '') ?? '';
	const pageParsed = pageSanitized ? parseInt(pageSanitized, 10) : 1;
	const page = Number.isFinite(pageParsed) && pageParsed > 0 ? pageParsed : 1;

	const rawIpp = url.searchParams.get('ipp');
	const ippSanitized = rawIpp?.replace(/\D/g, '') ?? '';
	const ippParsed = ippSanitized ? parseInt(ippSanitized, 10) : 4;
	const itemsPerPage = Math.min(100, Math.max(1, Number.isFinite(ippParsed) ? ippParsed : 4));

	const { topic, posts, count, topicsNav, page: listPage, itemsPerPage: ipp } =
		await publicBlogTopicBySlugPagePresenter.loadDataForTopicBySlugStateless({
			fetch,
			topicSlug,
			page,
			itemsPerPage
		});

	let metaTags: MetaTagsProps;
	if (!topic) {
		metaTags = await createMetaData({
			companyInformation: companyInformationPm,
			marketingInformation: marketingInformationPm,
			customTitle: `Topic Not Found | ${companyName}`,
			customDescription: 'The requested blog topic could not be found.',
			customSlug: `${getRootPathPublicBlog()}/topic/${topicSlug}`,
			requestUrl: url
		});
	} else {
		const customDescription =
			topic.description?.trim() || `Blog posts about ${topic.name}`;
		metaTags = await createMetaData({
			companyInformation: companyInformationPm,
			marketingInformation: marketingInformationPm,
			customTitle: `${topic.name} | ${companyName}`,
			customDescription,
			customTags: [topic.name],
			customSlug: `${getRootPathPublicBlog()}/topic/${topicSlug}`,
			requestUrl: url
		});
	}

	const pageMetaTags = Object.freeze({
		canonical: new URL(url.pathname, url.origin).href,
		openGraph: {
			title: String(CONFIG_SCHEMA_MARKETING.META_TITLE.default),
			description: String(CONFIG_SCHEMA_MARKETING.META_DESCRIPTION.default),
		},
		...metaTags
	}) satisfies MetaTagsProps;

	return {
		pageMetaTags,
		isLoggedIn,
		companyInformationPm,
		marketingInformationPm,
		topicSlug,
		topic,
		posts,
		count,
		topicsNav,
		page: listPage,
		itemsPerPage: ipp
	};
}
