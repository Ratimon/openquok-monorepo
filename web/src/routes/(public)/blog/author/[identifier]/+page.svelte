<script lang="ts">
	import type { PageData } from './$types';

	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { page } from '$app/state';

	import {
		getRootPathPublicBlog,
		getRootPathPublicBlogPost
	} from '$lib/area-public/constants/getRootPathPublicBlog';
	
	import BlogPostCardHighlightedPublic from '$lib/ui/components/blog-public/BlogPostCardHighlightedPublic.svelte';
	import BlogPostCardPublic from '$lib/ui/components/blog-public/BlogPostCardPublic.svelte';
	import Pagination from '$lib/ui/templates/Pagination.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Avatar from '$lib/ui/components/avatar';
	import SupabaseUserAvatar from '$lib/ui/supabase/SupabaseUserAvatar.svelte';
	import { Card, CardContent } from '$lib/ui/card';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import SubSectionInnerContainer from '$lib/ui/layouts/SubSectionInnerContainer.svelte';
	import SubSectionOuterContainer from '$lib/ui/layouts/SubSectionOuterContainer.svelte';
	import { url } from '$lib/utils/path';

	/** From `en.ts` — blog.blog-author-page */
	const AUTHOR_NOT_FOUND = 'Author Not Found';
	const BACK_TO_ALL = 'Back to All Posts';
	const VISIT_WEBSITE = 'Visit Website';
	const SEE_ALL_AUTHORS = 'See all our others';
	/** From `en.ts` — blog.blog-posts-overview-page.no-posts */
	const NO_POSTS = 'There are (yet) no published posts';

	type Props = {
		data: PageData;
	};

	let { data }: Props = $props();

	onMount(() => {
		if (!browser) return;
		if (!page.data.author) {
			void goto(url('/not-found'), { replaceState: true });
		}
	});

	let author = $derived(data.author);
	let posts = $derived(data.posts);
	let count = $derived(data.count);
	let itemsPerPage = $derived(data.itemsPerPage);
	let listPage = $derived(data.page);

	let blogIndexHref = $derived(url(`/${getRootPathPublicBlog()}`));
	let authorsIndexHref = $derived(url(`/${getRootPathPublicBlog()}/author`));

	function buildListUrl(overrides: Record<string, string | null | undefined>): string {
		const sp = new URLSearchParams(page.url.searchParams);
		for (const [key, val] of Object.entries(overrides)) {
			if (val === null || val === undefined || val === '') {
				sp.delete(key);
			} else {
				sp.set(key, val);
			}
		}
		if (sp.get('page') === '1') {
			sp.delete('page');
		}
		if (sp.get('ipp') === '4') {
			sp.delete('ipp');
		}
		const q = sp.toString();
		return `${page.url.pathname}${q ? `?${q}` : ''}`;
	}

	function postHref(slug: string): string {
		return url(`/${getRootPathPublicBlogPost(slug)}`);
	}

	function displayName(a: NonNullable<typeof author>): string {
		return a.fullName || a.username || 'Anonymous';
	}

	function postsByAuthorHeading(a: NonNullable<typeof author>): string {
		return `Posts by ${displayName(a)}`;
	}

	let totalPages = $derived(Math.max(1, Math.ceil(count / Math.max(itemsPerPage, 1))));
	let firstPost = $derived(posts[0]);
	let restPosts = $derived(posts.slice(1));
</script>

<SectionOuterContainer class="bg-base-100">
	<SubSectionOuterContainer class="md:py-10">
		<SubSectionInnerContainer class="max-w-7xl py-8">
			<section class="flex flex-col gap-2">
				{#if !author}
					<h1 class="mb-8 text-3xl font-bold">
						{AUTHOR_NOT_FOUND}</h1>
					<Button variant="outline" href={blogIndexHref}>
						{BACK_TO_ALL}</Button>
				{:else}
					<div class="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start">
						<Avatar.Root class="size-24 shrink-0 rounded-full">
							<SupabaseUserAvatar
								url={author.avatarUrl}
								size={96}
								alt={displayName(author)}
								imageOnly
							/>
							<Avatar.Fallback>
								{displayName(author).charAt(0).toUpperCase()}
							</Avatar.Fallback>
						</Avatar.Root>
						<div class="flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
							<div>
								<h1 class="mb-2 text-3xl font-bold">
									{displayName(author)}</h1>
								{#if author.tagLine}
									<p class="text-base-content/70 mb-4">
										{author.tagLine}</p>
								{/if}
								{#if author.website?.trim()}
									<Button
										variant="outline"
										size="sm"
										href={author.website.trim()}
										target="_blank"
										rel="noopener noreferrer"
									>
										{VISIT_WEBSITE}
									</Button>
								{/if}
							</div>
							<Button variant="outline" href={authorsIndexHref}>
								{SEE_ALL_AUTHORS}</Button>
						</div>
					</div>

					<h2 class="mb-8 text-2xl font-semibold">
						{postsByAuthorHeading(author)}</h2>

					{#if !posts.length}
						<Card>
							<CardContent class="p-6 text-center">
								<p class="text-base-content/80">
									{NO_POSTS}</p>
							</CardContent>
						</Card>
					{:else}
						<div class="grid gap-6">
							<div class="hidden md:block">
								<BlogPostCardHighlightedPublic post={firstPost} href={postHref(firstPost.slug)} />
							</div>

							<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
								<div class="md:hidden">
									<BlogPostCardPublic post={firstPost} href={postHref(firstPost.slug)} />
								</div>
								{#each restPosts as post (post.id)}
									<BlogPostCardPublic post={post} href={postHref(post.slug)} />
								{/each}
							</div>

							{#if count > 0}
								<Pagination
									{itemsPerPage}
									totalItems={count}
									currentPage={listPage}
									totalPages={totalPages}
									{buildListUrl}
									nameOfItems="posts"
									pageSizeOptions={[4, 13, 31]}
								/>
							{/if}
						</div>
					{/if}
				{/if}
			</section>
		</SubSectionInnerContainer>
	</SubSectionOuterContainer>
</SectionOuterContainer>
