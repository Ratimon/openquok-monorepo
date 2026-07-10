<script lang="ts">
	import type { PageData } from './$types';
	import type { PublicBlogMutationResultViewModel } from '$lib/area-public/PublicBlogBySlugPage.presenter.svelte';
	import type { BlogPostCommentViewModel } from '$lib/blogs/GetBlog.presenter.svelte';
	import type { BlogPostBySlugPublicViewModel } from '$lib/blogs/GetBlog.presenter.svelte';
	import type { BlogPostPublicViewModel } from '$lib/blogs/GetBlog.presenter.svelte';

	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { page } from '$app/state';

	import { toast } from '$lib/ui/sonner';

	import { publicBlogBySlugPagePresenter } from '$lib/area-public/index';
	import { getBillingPresenter } from '$lib/billing';
	import { planLimitsForTier } from 'openquok-common';
	import { getRootPathAccount } from '$lib/area-protected';
	import { authenticationRepository } from '$lib/user-auth';
	import { url, route } from '$lib/utils/path';
	import { getRootPathSignin, getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { getRootPathPublicBlogPost } from '$lib/area-public/constants/getRootPathPublicBlog';
	import { normalizeBlogInlineImagesInHtml, prepareBlogContentForDisplay } from '$lib/blogs/utils';

	import {
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		PUBLIC_BANNER_CTA_TEXT
	} from '$lib/config/constants/config';

	import BlogPost from '$lib/ui/components/blog-post/BlogPost.svelte';
	import BlogHubBreadcrumb from '$lib/ui/components/blog-public/BlogHubBreadcrumb.svelte';
	import CommunityFeaturesLimitUpgradeModal from '$lib/ui/components/blog-post/CommunityFeaturesLimitUpgradeModal.svelte';
	import LayoutInnerContainer from '$lib/ui/layouts/LayoutInnerContainer.svelte';
	import LayoutOuterContainer from '$lib/ui/layouts/LayoutOuterContainer.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';

	// /sign-in
	const rootPathSignIn = getRootPathSignin();
	const signInHrefBase = url(`/${rootPathSignIn}`);

	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);

	type Props = {
		data: {
			currentPostVm: BlogPostBySlugPublicViewModel;
			otherPostsVm: BlogPostPublicViewModel[];
			comments: BlogPostCommentViewModel[];
			isLoggedIn?: boolean;
			schemaData?: Record<string, unknown>;
		}
	} & PageData;

	let { data }: Props = $props();

	const isLoggedIn = $derived(
		authenticationRepository.isAuthenticated() || data.isLoggedIn === true
	);

	/** Owned-account plan (SOLO cannot comment on blog posts). */
	let viewerCommunityFeaturesEnabled = $state<boolean | null>(null);

	$effect(() => {
		if (!browser || !isLoggedIn) {
			viewerCommunityFeaturesEnabled = null;
			return;
		}
		let cancelled = false;
		void getBillingPresenter.loadOwnedAccountBillingVmStateless().then((vm) => {
			if (cancelled) return;
			viewerCommunityFeaturesEnabled = vm
				? planLimitsForTier(vm.tier).community_features
				: false;
		});
		return () => {
			cancelled = true;
		};
	});

	const communityCommentsEnabled = $derived.by(() => {
		if (!browser || !isLoggedIn) return true;
		return viewerCommunityFeaturesEnabled === true;
	});

	const communityUpgradeHref = $derived(
		isLoggedIn ? url(`${route(getRootPathAccount())}/billing`) : undefined
	);

	let communityUpgradeDialogOpen = $state(false);

	function openCommunityUpgradeDialog(): void {
		communityUpgradeDialogOpen = true;
	}

	onMount(() => {
		if (!browser) return;
		const vm = (page.data as PageData).currentPostVm as BlogPostBySlugPublicViewModel | null | undefined;
		if (!vm || vm.id === '') {
			void goto(url('/not-found'), { replaceState: true });
		}
	});

	let currentPostVm = $derived(data.currentPostVm);
	let otherPostsVm = $derived(data.otherPostsVm);
	let schemaData = $derived(data.schemaData);

	let normalizedContent = $state<string>('');

	const preparedContent = $derived(
		prepareBlogContentForDisplay(currentPostVm.content ?? '')
	);

	$effect(() => {
		if (!browser) return;
		normalizedContent = normalizeBlogInlineImagesInHtml(preparedContent);
	});

	let contentHtml = $derived(
		browser && normalizedContent ? normalizedContent : preparedContent
	);

	function postHref(slug: string): string {
		return url(`/${getRootPathPublicBlogPost(slug)}`);
	}

	let previousNav = $derived(
		otherPostsVm[0]
			? { name: otherPostsVm[0].title, href: postHref(otherPostsVm[0].slug) }
			: undefined
	);
	let nextNav = $derived(
		otherPostsVm[1]
			? { name: otherPostsVm[1].title, href: postHref(otherPostsVm[1].slug) }
			: undefined
	);

	let signInHref = $derived.by(() => {
		const pathname = page.url.pathname || '/';
		const search = page.url.search || '';
		const redirectTarget = `${pathname}${search}`;
		return `${signInHrefBase}?redirectURL=${encodeURIComponent(redirectTarget)}`;
	});

	let blogCommentSubmitting = $derived(publicBlogBySlugPagePresenter.submittingComment);
	let blogLikeSubmitting = $derived(publicBlogBySlugPagePresenter.submittingLike);
	let blogShareSubmitting = $derived(publicBlogBySlugPagePresenter.submittingShare);

	$effect(() => {
		if (!browser) return;
		if (!publicBlogBySlugPagePresenter.showCommentSubmitToast) return;
		const msg = publicBlogBySlugPagePresenter.commentSubmitToastMessage;
		if (publicBlogBySlugPagePresenter.commentSubmitToastIsError) {
			toast.error(msg);
		} else {
			toast.success(msg);
		}
		publicBlogBySlugPagePresenter.showCommentSubmitToast = false;
	});

	$effect(() => {
		if (!browser) return;
		if (!publicBlogBySlugPagePresenter.showLikeSubmitToast) return;
		const msg = publicBlogBySlugPagePresenter.likeSubmitToastMessage;
		if (publicBlogBySlugPagePresenter.likeSubmitToastIsError) {
			toast.error(msg);
		} else {
			toast.success(msg);
		}
		publicBlogBySlugPagePresenter.showLikeSubmitToast = false;
	});

	$effect(() => {
		if (!browser) return;
		if (!publicBlogBySlugPagePresenter.showShareSubmitToast) return;
		const msg = publicBlogBySlugPagePresenter.shareSubmitToastMessage;
		if (publicBlogBySlugPagePresenter.shareSubmitToastIsError) {
			toast.error(msg);
		} else {
			toast.success(msg);
		}
		publicBlogBySlugPagePresenter.showShareSubmitToast = false;
	});

	async function submitBlogComment(params: {
		postId: string;
		content: string;
		parentId: string | null;
	}): Promise<PublicBlogMutationResultViewModel> {
		return publicBlogBySlugPagePresenter.submitBlogComment(params);
	}

	async function trackBlogLike(postId: string): Promise<PublicBlogMutationResultViewModel> {
		return publicBlogBySlugPagePresenter.trackBlogLike(postId);
	}

	async function trackBlogShare(postId: string): Promise<PublicBlogMutationResultViewModel> {
		return publicBlogBySlugPagePresenter.trackBlogShare(postId);
	}

	async function trackBlogView(postId: string): Promise<PublicBlogMutationResultViewModel> {
		return publicBlogBySlugPagePresenter.trackBlogView(postId);
	}
</script>

<JsonLdHead schemaData={schemaData} />

<LayoutOuterContainer class="bg-base-100 pt-6 pb-6 md:pt-8 md:pb-10">
	<LayoutInnerContainer class="mx-auto w-full pb-4">
		<BlogHubBreadcrumb pageTitle={currentPostVm.title} class="mb-4" />
		<BlogPost
			post={currentPostVm}
			{contentHtml}
			comments={data.comments}
			previousLink={previousNav}
			nextLink={nextNav}
			{isLoggedIn}
			{signInHref}
			{submitBlogComment}
			submittingComment={blogCommentSubmitting}
			{communityCommentsEnabled}
			onCommunityUpgradeRequired={openCommunityUpgradeDialog}
			{trackBlogLike}
			submittingLike={blogLikeSubmitting}
			{trackBlogShare}
			submittingShare={blogShareSubmitting}
			{trackBlogView}
		/>
		<CenteredDarkCtaBanner
			title={CENTERED_DARK_CTA_BANNER_TITLE}
			description={CENTERED_DARK_CTA_BANNER_DESCRIPTION}
			ctaText={PUBLIC_BANNER_CTA_TEXT}
			ctaHref={signUpPath}
			sectionClass="pt-10 pb-0"
		/>
	</LayoutInnerContainer>
</LayoutOuterContainer>

<CommunityFeaturesLimitUpgradeModal
	bind:open={communityUpgradeDialogOpen}
	upgradeHref={communityUpgradeHref}
/>
