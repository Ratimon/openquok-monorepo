import type { MetaTagsProps } from 'svelte-meta-tags';

import { CONFIG_SCHEMA_BLOG } from '$lib/blogs/constants/config';
import { blogPublicTopicIdParamSchema } from '$lib/blogs/blog.types';
import { getRootPathPublicBlog } from '$lib/area-public/constants/getRootPathPublicBlog';
import { blogRepository } from '$lib/blogs/index';
import {
	publicBlogPagePresenter,
	publicBlogTopicPagePresenter,
	publicInformationRepository
} from '$lib/area-public/index';
import { createMetaData } from '$lib/utils/createMetaData';

export const ssr = true;

export async function load({ url, fetch, cookies }) {
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformation: companyInformationPm, marketingInformation: marketingInformationPm } =
		await publicInformationRepository.getAllInformationCombined();

	const { CONFIG_SCHEMA_COMPANY, CONFIG_SCHEMA_MARKETING } = await import('$lib/config/constants/config');
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const rootBlog = getRootPathPublicBlog();
	const blogInformationPm = await blogRepository.getBlogInformation(fetch);
	const heroTitle = blogInformationPm?.BLOG_POST_SEO_META_TITLE ?? CONFIG_SCHEMA_BLOG.BLOG_POST_SEO_META_TITLE.default;
	const heroDescription =
		blogInformationPm?.BLOG_POST_SEO_META_DESCRIPTION ?? CONFIG_SCHEMA_BLOG.BLOG_POST_SEO_META_DESCRIPTION.default;
	const customTags =
		blogInformationPm?.BLOG_POST_SEO_META_TAGS?.split(',').map((t) => t.trim()).filter(Boolean) ?? undefined;

	const metaTags = await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${heroTitle} | ${companyName}`,
		customDescription: heroDescription,
		customTags,
		customSlug: rootBlog,
		requestUrl: url
	}) satisfies MetaTagsProps;

	const pageMetaTags = Object.freeze({
		canonical: new URL(url.pathname, url.origin).href,
		openGraph: {
			title: String(CONFIG_SCHEMA_MARKETING.META_TITLE.default),
			description: String(CONFIG_SCHEMA_MARKETING.META_DESCRIPTION.default),
		},
		...metaTags
	}) satisfies MetaTagsProps;

	// Extract and validate query params for SSR.
	const rawPage = url.searchParams.get('page');
	const pageSanitized = rawPage?.replace(/\D/g, '') ?? '';
	const pageParsed = pageSanitized ? parseInt(pageSanitized, 10) : 1;
	const page = Number.isFinite(pageParsed) && pageParsed > 0 ? pageParsed : 1;

	const rawIpp = url.searchParams.get('ipp');
	const ippSanitized = rawIpp?.replace(/\D/g, '') ?? '';
	const ippParsed = ippSanitized ? parseInt(ippSanitized, 10) : 4;
	const itemsPerPage = Math.min(100, Math.max(1, Number.isFinite(ippParsed) ? ippParsed : 4));

	const topicRaw = url.searchParams.get('topic');
	let topicId: string | null = null;
	if (topicRaw && topicRaw !== 'all') {
		const parsed = blogPublicTopicIdParamSchema.safeParse(topicRaw);
		topicId = parsed.success ? parsed.data : null;
	}

	const authorRaw = url.searchParams.get('author');
	let authorId: string | null = null;
	if (authorRaw?.trim()) {
		const parsed = blogPublicTopicIdParamSchema.safeParse(authorRaw.trim());
		authorId = parsed.success ? parsed.data : null;
	}

	const [overview, topicsOverview] = await Promise.all([
		publicBlogPagePresenter.loadDataForOverviewBlogStateless({
			fetch,
			page,
			itemsPerPage,
			topicId,
			authorId
		}),
		publicBlogTopicPagePresenter.loadDataForTopicsOverviewStateless({ fetch })
	]);

	const { topics: _topicsForNavRemoved, ...overviewRest } = overview;

	return {
		pageMetaTags,
		isLoggedIn,
		companyInformationPm,
		marketingInformationPm,
		heroTitle,
		heroDescription,
		...overviewRest,
		topicsNav: topicsOverview.topics
	};
}
