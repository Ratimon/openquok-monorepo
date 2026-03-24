import type { MetaTagsProps } from 'svelte-meta-tags';

import { getRootPathPublicBlog, getRootPathPublicBlogAuthor } from '$lib/area-public/constants/getRootPathPublicBlog';
import { publicBlogAuthorByIdentifierPagePresenter, publicInformationRepository } from '$lib/area-public/index';
import { createMetaData } from '$lib/utils/createMetaData';

export const ssr = true;

export async function load({ url, params, fetch, cookies }) {
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const identifier = typeof params.identifier === 'string' ? params.identifier : '';

	const { companyInformation: companyInformationPm, marketingInformation: marketingInformationPm } =
		await publicInformationRepository.getAllInformationCombined();

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
		identifier,
		author,
		posts,
		count,
		page: listPage,
		itemsPerPage: ipp
	};
}
