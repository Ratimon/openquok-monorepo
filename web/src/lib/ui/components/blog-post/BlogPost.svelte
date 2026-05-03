<script lang="ts">
	import { onMount } from 'svelte';

	import type { PublicBlogMutationResultViewModel } from '$lib/area-public/PublicBlogBySlugPage.presenter.svelte';
	import type { BlogPostCommentViewModel } from '$lib/blogs/GetBlog.presenter.svelte';
	import type { BlogPostBySlugPublicViewModel } from '$lib/blogs/GetBlog.presenter.svelte';

	import { browser } from '$app/environment';

	import { syncBlogHeadingIds } from '$lib/blogs/utils';
	import { getRootPathPublicBlog, getRootPathPublicBlogAuthor } from '$lib/area-public/constants/getRootPathPublicBlog';
	import { getRootPathSignin } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { stringToSlug } from '$lib/ui/helpers/common';
	import { url } from '$lib/utils/path';

	import { Badge } from '$lib/ui/badge';
	import AuthorInfo from '$lib/ui/components/blog-post/AuthorInfo.svelte';
	import BlogComments from '$lib/ui/components/blog-post/BlogComments.svelte';
	import BlogLikeButton from '$lib/ui/components/blog-post/BlogLikeButton.svelte';
	import BlogShare from '$lib/ui/components/blog-post/BlogShare.svelte';
	import BlogViewPixel from '$lib/ui/components/blog-post/BlogViewPixel.svelte';
	import PostNavigation from '$lib/ui/components/blog-post/PostNavigation.svelte';
	import TableOfContents from '$lib/ui/components/blog-post/TableOfContents.svelte';
	import FormattedISODate from '$lib/ui/components/FormattedISODate.svelte';
	import SupabaseImage from '$lib/ui/supabase/SupabaseImage.svelte';
	import OneColSection from '$lib/ui/layouts/OneColSection.svelte';

	type NavLink = { name: string; href: string };

	type Props = {
		post: BlogPostBySlugPublicViewModel;
		contentHtml: string;
		comments: BlogPostCommentViewModel[];
		previousLink?: NavLink;
		nextLink?: NavLink;
		isLoggedIn?: boolean;
		signInHref?: string;
		composerAvatarUrl?: string | null;
		submitBlogComment: (params: {
			postId: string;
			content: string;
			parentId: string | null;
		}) => Promise<PublicBlogMutationResultViewModel>;
		submittingComment?: boolean;
		trackBlogLike: (postId: string) => Promise<PublicBlogMutationResultViewModel>;
		submittingLike?: boolean;
		trackBlogShare: (postId: string) => Promise<PublicBlogMutationResultViewModel>;
		submittingShare?: boolean;
		trackBlogView: (postId: string) => Promise<PublicBlogMutationResultViewModel>;
		class?: string;
	};

	let {
		post,
		contentHtml,
		comments,
		previousLink,
		nextLink,
		isLoggedIn = false,
		signInHref = url(`/${getRootPathSignin()}`),
		composerAvatarUrl = null,
		submitBlogComment,
		submittingComment = false,
		trackBlogLike,
		submittingLike = false,
		trackBlogShare,
		submittingShare = false,
		trackBlogView,
		class: className = ''
	}: Props = $props();

	let publishedAt = $derived(post.publishedAt ?? post.createdAt);
	let updatedAt = $derived(post.updatedAt ?? '');
	let showUpdated = $derived(
		!!post.publishedAt &&
			!!post.updatedAt &&
			new Date(post.updatedAt).toDateString() !== new Date(post.publishedAt).toDateString()
	);

	let minutes = $derived(post.readingTimeMinutes ?? 0);
	let readingLabel = $derived(`${minutes} min read`);

	let authorDisplay = $derived(post.author?.fullName ?? post.author?.username ?? 'Anonymous');

	let topicPageHref = $derived(
		post.topic ? url(`/${getRootPathPublicBlog()}/topic/${post.topic.slug}`) : ''
	);

	let authorProfileHref = $derived(
		post.author
			? url(
					`/${getRootPathPublicBlogAuthor(
						stringToSlug(post.author.fullName || post.author.username || 'Anonymous')
					)}`
				)
			: null
	);

	let proseEl: HTMLDivElement | undefined = $state();

	onMount(() => {
		if (!browser || !proseEl) return;
		const raw = post.content ?? '';
		if (!raw) return;
		syncBlogHeadingIds(proseEl, raw);
		const hash = window.location.hash;
		if (hash.length > 1) {
			const id = hash.slice(1);
			requestAnimationFrame(() => {
				document.getElementById(id)?.scrollIntoView({ behavior: 'auto', block: 'start' });
			});
		}
	});
</script>

<div class={className}>
	<BlogViewPixel postId={post.id} {trackBlogView} />

	<OneColSection class="rounded-md bg-base-200 py-4 text-base-content">
		<div class="relative flex w-full flex-row gap-x-4 md:gap-x-8 lg:gap-x-10">
			<div class="mx-auto w-full space-y-4 p-4 text-center">
				<div class="flex flex-wrap items-center justify-center gap-2">
					{#if post.isSponsored}
						<span class="badge badge-secondary badge-sm">Sponsored</span>
					{/if}
					{#if post.isFeatured}
						<span class="badge badge-outline badge-sm">Featured</span>
					{/if}
				</div>
				{#if post.topic}
					<div>
						<span id="blog-topic-badge-label" class="sr-only">Blog Topic</span>
						<Badge
							variant="outline"
							dataTestid="blog-topic-badge"
							ariaLabelledby="blog-topic-badge-label"
							class="inline-flex [&_a]:text-inherit"
						>
							<a href={topicPageHref} class="font-semibold">
								{post.topic.name}
							</a>
						</Badge>
					</div>
				{/if}

				<h1 class="mb-2 mt-4 max-w-5xl text-center text-4xl font-black md:text-7xl">
					{post.title}
				</h1>

				<div class="flex flex-wrap items-center justify-center gap-4 text-sm text-base-content/70">
					<span class="flex flex-wrap items-center justify-center gap-4">
						<FormattedISODate date={publishedAt} class="text-inherit" />
						{#if showUpdated && updatedAt}
							<span class="hidden sm:inline">•</span>
							<span>
								Updated <FormattedISODate date={updatedAt} class="text-inherit" />
							</span>
						{/if}
					</span>
				</div>

				<div class="flex flex-wrap items-center justify-center gap-4 text-sm text-base-content/70">
					<span>{readingLabel}</span>
					{#if post.author && authorProfileHref}
						<span aria-hidden="true">•</span>
						<a href={authorProfileHref} class="underline underline-offset-2 hover:text-primary">
							{authorDisplay}
						</a>
					{/if}
				</div>
			</div>
		</div>
	</OneColSection>

	<!-- TOC + article + sidebar: full width of LayoutInnerContainer (template OneColSection, no inner max-w-6xl) -->
	<OneColSection class="mt-2 w-full pb-8">
		<div class="relative flex w-full flex-row gap-x-4 md:gap-x-6 lg:gap-x-8">
			<div class="mt-4 shrink-0 md:mt-0 md:w-44 lg:w-48">
				<TableOfContents title="Table of contents" content={post.content ?? ''} />
			</div>

			<div class="flex min-w-0 flex-1 flex-col">
				<article
					aria-labelledby="blog-post-content-label"
					data-testid="blog-post-content"
					class="gap-8 rounded-md border border-base-300 bg-base-100 p-4 py-8"
				>
					<span id="blog-post-content-label" class="sr-only">Blog post content</span>

					{#if post.heroImageFilename}
						<div
							class="relative h-auto w-full overflow-hidden rounded-lg"
							data-testid="blog-post-hero-image"
						>
							<SupabaseImage
								dbImageUrl={post.heroImageFilename}
								database="blog_images"
								width={1200}
								height={630}
								class="h-auto w-full rounded-t-md object-cover"
								imageAlt={post.title}
							/>
						</div>
					{/if}

					<div
						bind:this={proseEl}
						class="prose prose-lg max-w-none text-base-content prose-headings:text-base-content prose-headings:scroll-mt-28 prose-p:text-base-content/90 prose-strong:text-base-content prose-a:text-primary prose-blockquote:border-base-content/20 prose-blockquote:text-base-content/80 prose-code:text-base-content prose-li:marker:text-base-content/60"
					>
						{@html contentHtml}
					</div>
				</article>

				<div class="mt-8">
					<BlogComments
						{comments}
						postId={post.id}
						{isLoggedIn}
						{signInHref}
						{composerAvatarUrl}
						{submitBlogComment}
						{submittingComment}
					/>
				</div>

				<PostNavigation previousLink={previousLink} nextLink={nextLink} class="mt-4" />
			</div>

			<div class="shrink-0 md:w-44 lg:w-48">
				<div class="sticky flex h-fit w-full flex-col md:top-[180px]">
					<AuthorInfo author={post.author} />
					<div class="flex flex-col gap-4">
						<BlogLikeButton
							postId={post.id}
							initialLikeCount={post.likeCount ?? 0}
							{trackBlogLike}
							{submittingLike}
						/>
						<BlogShare
							postId={post.id}
							title={post.title}
							slug={post.slug}
							{trackBlogShare}
							{submittingShare}
						/>
					</div>
				</div>
			</div>
		</div>
	</OneColSection>
</div>
