import { blogRepository, getBlogPresenter } from '$lib/blogs/index';
import { getScheduledPostsPresenter, postsRepository } from '$lib/posts/index';
import { PublicBlogPagePresenter } from '$lib/area-public/PublicBlogPage.presenter.svelte';
import { PublicBlogTopicPagePresenter } from '$lib/area-public/PublicBlogTopicPage.presenter.svelte';
import { PublicBlogTopicBySlugPagePresenter } from '$lib/area-public/PublicBlogTopicBySlugPage.presenter.svelte';
import { PublicBlogAuthorPagePresenter } from '$lib/area-public/PublicBlogAuthorPage.presenter.svelte';
import { PublicBlogAuthorByIdentifierPagePresenter } from '$lib/area-public/PublicBlogAuthorByIdentifierPage.presenter.svelte';
import { PublicBlogBySlugPagePresenter } from '$lib/area-public/PublicBlogBySlugPage.presenter.svelte';
import { PublicPreviewPostByIdPagePresenter } from '$lib/area-public/PublicPreviewPostByIdPage.presenter.svelte';
import { PublicLayoutPagePresenter } from '$lib/area-public/PublicLayoutPage.presenter.svelte';
import { PublicAgentByPagePresenter, isPublicAgentHostLandingPage, isPublicMcpLandingPage } from '$lib/area-public/PublicAgentByPage.presenter.svelte';
import { PublicAgentsPagePresenter } from '$lib/area-public/PublicAgentsPage.presenter.svelte';
import { PublicChannelByPagePresenter } from '$lib/area-public/PublicChannelByPage.presenter.svelte';
import { PublicChannelsPagePresenter } from '$lib/area-public/PublicChannelsPage.presenter.svelte';
import { PublicExtensionBySlugPagePresenter } from '$lib/area-public/PublicExtensionBySlugPage.presenter.svelte';
import { PublicExtensionsPagePresenter } from '$lib/area-public/PublicExtensionsPage.presenter.svelte';
import {
	PublicStackBySlugPagePresenter,
	PublicStacksPagePresenter
} from '$lib/area-public/PublicStacksPage.presenter.svelte';
import { PublicAgentBuilderPagePresenter } from '$lib/area-public/PublicAgentBuilderPage.presenter.svelte';
import { PublicToolsPagePresenter } from '$lib/area-public/PublicToolsPage.presenter.svelte';
import { PublicPricingPagePresenter } from '$lib/area-public/PublicPricingPage.presenter.svelte';
import { getPublicPricingPresenter } from '$lib/billing';
import { getListingPresenter, listingRepository } from '$lib/listings/index';

const publicLayoutPagePresenter = new PublicLayoutPagePresenter();
const publicBlogPagePresenter = new PublicBlogPagePresenter(getBlogPresenter);
const publicBlogTopicPagePresenter = new PublicBlogTopicPagePresenter(getBlogPresenter);
const publicBlogTopicBySlugPagePresenter = new PublicBlogTopicBySlugPagePresenter(getBlogPresenter);
const publicBlogAuthorPagePresenter = new PublicBlogAuthorPagePresenter(getBlogPresenter);
const publicBlogAuthorByIdentifierPagePresenter = new PublicBlogAuthorByIdentifierPagePresenter(getBlogPresenter);
const publicBlogBySlugPagePresenter = new PublicBlogBySlugPagePresenter(getBlogPresenter, blogRepository);
const publicPreviewPostByIdPagePresenter = new PublicPreviewPostByIdPagePresenter(getScheduledPostsPresenter, postsRepository);
const publicPricingPagePresenter = new PublicPricingPagePresenter(getPublicPricingPresenter);
const publicAgentsPagePresenter = new PublicAgentsPagePresenter();
const publicAgentByPagePresenter = new PublicAgentByPagePresenter();
const publicChannelsPagePresenter = new PublicChannelsPagePresenter();
const publicChannelByPagePresenter = new PublicChannelByPagePresenter();
const publicExtensionsPagePresenter = new PublicExtensionsPagePresenter(getListingPresenter);
const publicExtensionBySlugPagePresenter = new PublicExtensionBySlugPagePresenter(
	getListingPresenter,
	listingRepository
);
const publicStacksPagePresenter = new PublicStacksPagePresenter(getListingPresenter);
const publicStackBySlugPagePresenter = new PublicStackBySlugPagePresenter(
	getListingPresenter,
	listingRepository
);
const publicToolsPagePresenter = new PublicToolsPagePresenter();
const publicAgentBuilderPagePresenter = new PublicAgentBuilderPagePresenter(getListingPresenter);

export {
	publicAgentByPagePresenter,
	publicAgentsPagePresenter,
	publicChannelByPagePresenter,
	publicChannelsPagePresenter,
	publicExtensionBySlugPagePresenter,
	publicExtensionsPagePresenter,
	publicStacksPagePresenter,
	publicStackBySlugPagePresenter,
	publicToolsPagePresenter,
	publicAgentBuilderPagePresenter,
	publicPricingPagePresenter,
	publicLayoutPagePresenter,
	publicBlogPagePresenter,
	publicBlogTopicPagePresenter,
	publicBlogTopicBySlugPagePresenter,
	publicBlogAuthorPagePresenter,
	publicBlogAuthorByIdentifierPagePresenter,
	publicBlogBySlugPagePresenter,
	publicPreviewPostByIdPagePresenter,
	PublicPricingPagePresenter,
	isPublicAgentHostLandingPage,
	isPublicMcpLandingPage
};
