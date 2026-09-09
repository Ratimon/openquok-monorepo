import type { MetaTagsProps } from 'svelte-meta-tags';

import { getRootPathPublicBlog, getRootPathPublicBlogAuthor } from '$lib/area-public/constants/getRootPathPublicBlog';
import { publicBlogAuthorByIdentifierPagePresenter } from '$lib/area-public/index';
import { parseBlogPublicListPagination } from '$lib/blogs/utils/blogPublicListPagination';
import { createBlogAuthorSEOSchema } from '$lib/blogs/utils/createBlogHubSEOSchema';
import { createMetaData } from '$lib/seo/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/seo/buildCanonicalUrl';

export const ssr = true;

export async function load({ url, params, fetch, cookies, parent }) {
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const identifier = typeof params.identifier === 'string' ? params.identifier : '';

	const { companyInformationPm, marketingInformationPm } = await parent();

	const { CONFIG_SCHEMA_COMPANY, CONFIG_SCHEMA_MARKETING } = await import('$lib/config/constants/config');
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const { page, itemsPerPage } = parseBlogPublicListPagination(url.searchParams);

	const { author, posts, count, page: listPage, itemsPerPage: ipp } =
		await publicBlogAuthorByIdentifierPagePresenter.loadDataForAuthorByIdentifierStateless({
			fetch,
			identifier,
			page,
			itemsPerPage
		});

	let metaTags: MetaTagsProps;
	if (!author) {
		metaTags = await createMetaData({
			companyInformation: companyInformationPm,
			marketingInformation: marketingInformationPm,
			customTitle: `Author Not Found | ${companyName}`,
			customDescription: 'The requested blog author could not be found.',
			customSlug: `${getRootPathPublicBlogAuthor(identifier)}`,
			requestUrl: url
		});
	} else {
		const displayName = author.fullName || author.username || 'Anonymous';
		const customDescription =
			author.tagLine?.trim() || `Blog posts by ${displayName}`;
		metaTags = await createMetaData({
			companyInformation: companyInformationPm,
			marketingInformation: marketingInformationPm,
			customTitle: `${displayName} | ${companyName}`,
			customDescription,
			customTags: [displayName],
			customSlug: `${getRootPathPublicBlogAuthor(identifier)}`,
			requestUrl: url
		});
	}

	const canonical = buildCanonicalUrl(url);
	const pageMetaTags = withCanonicalMetaTags(metaTags, canonical, {
		openGraph: {
			title: String(CONFIG_SCHEMA_MARKETING.META_TITLE.default),
			description: String(CONFIG_SCHEMA_MARKETING.META_DESCRIPTION.default)
		}
	});

	const schemaData =
		author != null
			? createBlogAuthorSEOSchema({
					canonicalUrl: canonical,
					origin: url.origin,
					companyName,
					author,
					identifier,
					posts
				})
			: undefined;

	return {
		pageMetaTags,
		isLoggedIn,
		companyInformationPm,
		marketingInformationPm,
		identifier,
		author,
		posts,
		count,
		page: listPage,
		itemsPerPage: ipp,
		schemaData
	};
}
