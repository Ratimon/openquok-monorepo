import type { PublicInformationConfig } from '$lib/area-public/PublicInformation.repository.svelte';
import { blogRepository, getBlogPresenter } from '$lib/blog/index';
import { getScheduledPostsPresenter, postsRepository } from '$lib/posts/index';
import { httpGateway } from '$lib/core/index';
import { PublicBlogPagePresenter } from '$lib/area-public/PublicBlogPage.presenter.svelte';
import { PublicBlogTopicPagePresenter } from '$lib/area-public/PublicBlogTopicPage.presenter.svelte';
import { PublicBlogTopicBySlugPagePresenter } from '$lib/area-public/PublicBlogTopicBySlugPage.presenter.svelte';
import { PublicBlogAuthorPagePresenter } from '$lib/area-public/PublicBlogAuthorPage.presenter.svelte';
import { PublicBlogAuthorByIdentifierPagePresenter } from '$lib/area-public/PublicBlogAuthorByIdentifierPage.presenter.svelte';
import { PublicBlogBySlugPagePresenter } from '$lib/area-public/PublicBlogBySlugPage.presenter.svelte';
import { PublicPreviewPostByIdPagePresenter } from '$lib/area-public/PublicPreviewPostByIdPage.presenter.svelte';
import { PublicInformationRepository } from '$lib/area-public/PublicInformation.repository.svelte';
import { PublicLayoutPagePresenter } from '$lib/area-public/PublicLayoutPage.presenter.svelte';

const publicInformationConfig: PublicInformationConfig = {
	endpoints: {
		companyInformationByProperties: '/api/v1/company/information/properties',
		companyInformation: '/api/v1/company/information',
		informationCombined: '/api/v1/company/information/combined',
		informationByPropertiesCombined: '/api/v1/company/information/properties/combined'
	}
};

const publicInformationRepository = new PublicInformationRepository(
	httpGateway,
	publicInformationConfig
);

const publicLayoutPagePresenter = new PublicLayoutPagePresenter(publicInformationRepository);
const publicBlogPagePresenter = new PublicBlogPagePresenter(getBlogPresenter);
const publicBlogTopicPagePresenter = new PublicBlogTopicPagePresenter(getBlogPresenter);
const publicBlogTopicBySlugPagePresenter = new PublicBlogTopicBySlugPagePresenter(getBlogPresenter);
const publicBlogAuthorPagePresenter = new PublicBlogAuthorPagePresenter(getBlogPresenter);
const publicBlogAuthorByIdentifierPagePresenter = new PublicBlogAuthorByIdentifierPagePresenter(getBlogPresenter);
const publicBlogBySlugPagePresenter = new PublicBlogBySlugPagePresenter(getBlogPresenter, blogRepository);
const publicPreviewPostByIdPagePresenter = new PublicPreviewPostByIdPagePresenter(getScheduledPostsPresenter, postsRepository);

export {
	publicInformationRepository,
	publicLayoutPagePresenter,
	publicBlogPagePresenter,
	publicBlogTopicPagePresenter,
	publicBlogTopicBySlugPagePresenter,
	publicBlogAuthorPagePresenter,
	publicBlogAuthorByIdentifierPagePresenter,
	publicBlogBySlugPagePresenter,
	publicPreviewPostByIdPagePresenter
};
