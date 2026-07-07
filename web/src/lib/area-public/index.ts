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
import { PublicBuildingBlockBySlugPagePresenter } from '$lib/area-public/PublicBuildingBlockBySlugPage.presenter.svelte';
import { PublicBuildingBlocksPagePresenter } from '$lib/area-public/PublicBuildingBlocksPage.presenter.svelte';
import {
	PublicCreatorByUsernamePagePresenter,
	PublicCreatorsPagePresenter
} from '$lib/area-public/PublicCreatorsPage.presenter.svelte';
import {
	PublicPlaybookBySlugPagePresenter,
	PublicPlaybooksPagePresenter
} from '$lib/area-public/PublicPlaybooksPage.presenter.svelte';
import { PublicSkillBuilderPagePresenter } from '$lib/area-public/PublicSkillBuilderPage.presenter.svelte';
import { PublicPhotoEditorPagePresenter } from '$lib/area-public/PublicPhotoEditorPage.presenter.svelte';
import { PublicToolsPagePresenter } from '$lib/area-public/PublicToolsPage.presenter.svelte';
import { PublicPricingPagePresenter } from '$lib/area-public/PublicPricingPage.presenter.svelte';
import { GenerateMediaModalPresenter } from '$lib/canvas';
import { getPublicPricingPresenter } from '$lib/billing';
import { getListingPresenter, listingRepository } from '$lib/listings/index';
import { mediaRepository } from '$lib/medias';

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
const publicBuildingBlocksPagePresenter = new PublicBuildingBlocksPagePresenter(
	getListingPresenter,
	listingRepository
);
const publicBuildingBlockBySlugPagePresenter = new PublicBuildingBlockBySlugPagePresenter(
	getListingPresenter,
	listingRepository
);
const publicPlaybooksPagePresenter = new PublicPlaybooksPagePresenter(getListingPresenter, listingRepository);
const publicPlaybookBySlugPagePresenter = new PublicPlaybookBySlugPagePresenter(
	getListingPresenter,
	listingRepository
);
const publicCreatorsPagePresenter = new PublicCreatorsPagePresenter(getListingPresenter, listingRepository);
const publicCreatorByUsernamePagePresenter = new PublicCreatorByUsernamePagePresenter(
	getListingPresenter,
	listingRepository
);
const publicToolsPagePresenter = new PublicToolsPagePresenter();
const publicSkillBuilderPagePresenter = new PublicSkillBuilderPagePresenter(getListingPresenter);
const publicPhotoEditorPagePresenter = new PublicPhotoEditorPagePresenter();
const publicPhotoEditorCanvasPresenter = new GenerateMediaModalPresenter(mediaRepository);

export {
	publicAgentByPagePresenter,
	publicAgentsPagePresenter,
	publicChannelByPagePresenter,
	publicChannelsPagePresenter,
	publicBuildingBlockBySlugPagePresenter,
	publicBuildingBlocksPagePresenter,
	publicPlaybooksPagePresenter,
	publicPlaybookBySlugPagePresenter,
	publicCreatorsPagePresenter,
	publicCreatorByUsernamePagePresenter,
	publicToolsPagePresenter,
	publicSkillBuilderPagePresenter,
	publicPhotoEditorPagePresenter,
	publicPhotoEditorCanvasPresenter,
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
