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
	import { url } from '$lib/utils/path';
	import { getRootPathSignin } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { getRootPathPublicBlogPost } from '$lib/area-public/constants/getRootPathPublicBlog';
	import { normalizeBlogInlineImagesInHtml } from '$lib/blogs/utils';

	import BlogPost from '$lib/ui/components/blog-post/BlogPost.svelte';

	import LayoutInnerContainer from '$lib/ui/layouts/LayoutInnerContainer.svelte';
	import LayoutOuterContainer from '$lib/ui/layouts/LayoutOuterContainer.svelte';

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

	$effect(() => {
		if (!browser) return;
		normalizedContent = normalizeBlogInlineImagesInHtml(data.currentPostVm.content ?? '');
	});

	let contentHtml = $derived(normalizedContent || (currentPostVm.content ?? ''));

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
		const signInBase = url(`/${getRootPathSignin()}`);
		const pathname = page.url.pathname || '/';
		const search = page.url.search || '';
		const redirectTarget = `${pathname}${search}`;
		return `${signInBase}?redirectURL=${encodeURIComponent(redirectTarget)}`;
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

<svelte:head>
	{#if schemaData}
		<script type="application/ld+json">{JSON.stringify(schemaData)}</script>
	{/if}
</svelte:head>

<LayoutOuterContainer class="bg-base-100 pt-6 pb-6 md:pt-8 md:pb-10">
	<LayoutInnerContainer class="mx-auto w-full pb-4">
		<BlogPost
			post={currentPostVm}
			{contentHtml}
			comments={data.comments}
			previousLink={previousNav}
			nextLink={nextNav}
			isLoggedIn={data.isLoggedIn === true}
			{signInHref}
			{submitBlogComment}
			submittingComment={blogCommentSubmitting}
			{trackBlogLike}
			submittingLike={blogLikeSubmitting}
			{trackBlogShare}
			submittingShare={blogShareSubmitting}
			{trackBlogView}
		/>
	</LayoutInnerContainer>
</LayoutOuterContainer>
