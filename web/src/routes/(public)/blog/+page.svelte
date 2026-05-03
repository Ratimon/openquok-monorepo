<script lang="ts">
	import type { PageData } from './$types';

	import { page } from '$app/state';

	import { getRootPathPublicBlogPost } from '$lib/area-public/constants/getRootPathPublicBlog';
	import { url } from '$lib/utils/path';

	import BlogPostCardHighlightedPublic from '$lib/ui/components/blog-public/BlogPostCardHighlightedPublic.svelte';
	import BlogPostCardPublic from '$lib/ui/components/blog-public/BlogPostCardPublic.svelte';
	import BlogTopicsNavigation from '$lib/ui/components/blog-topics/BlogTopicsNavigation.svelte';
	import Pagination from '$lib/ui/templates/Pagination.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import { Card, CardContent } from '$lib/ui/card';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import SubSectionInnerContainer from '$lib/ui/layouts/SubSectionInnerContainer.svelte';
	import SubSectionOuterContainer from '$lib/ui/layouts/SubSectionOuterContainer.svelte';
	
	type Props = {
		data: PageData;
	};

	let { data }: Props = $props();

	let posts = $derived(data.posts);
	let count = $derived(data.count);
	let itemsPerPage = $derived(data.itemsPerPage);
	let listPage = $derived(data.page);
	let topicId = $derived(data.topicId);
	let topicsNav = $derived(data.topicsNav);
	let heroTitle = $derived(data.heroTitle);
	let heroDescription = $derived(data.heroDescription);

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

	let activeTopicSlug = $derived(
		topicId && topicsNav.length ? (topicsNav.find((t) => t.id === topicId)?.slug ?? null) : null
	);

	function postHref(slug: string): string {
		return url(`/${getRootPathPublicBlogPost(slug)}`);
	}

	const rssBase = '/api/v1/blog-system/rss';

	let totalPages = $derived(Math.max(1, Math.ceil(count / Math.max(itemsPerPage, 1))));
	let firstPost = $derived(posts[0]);
	let restPosts = $derived(posts.slice(1));

</script>

<SectionOuterContainer class="bg-base-100">
	<SubSectionOuterContainer class="md:py-10">
		<SubSectionInnerContainer class="max-w-7xl py-8">
			<section class="flex flex-col gap-2">
				<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<h1 class="text-3xl font-bold">
						{heroTitle}</h1>
					<div class="flex flex-wrap gap-2">
						<Button variant="outline" size="sm" href={`${rssBase}?format=rss`}>
							RSS</Button>
						<Button variant="outline" size="sm" href={`${rssBase}?format=atom`}>
							Atom</Button>
						<Button variant="outline" size="sm" href={`${rssBase}?format=json`}>
							JSON</Button>
					</div>
				</div>
				<p class="text-base-content/70 max-w-3xl">
					{heroDescription}</p>

				<BlogTopicsNavigation class="mb-2" topics={topicsNav} activeTopicSlug={activeTopicSlug} />

				{#if !posts.length}
					<Card>
						<CardContent class="p-6 text-center">
							<p class="text-base-content/80">
								No posts yet. Check back soon.</p>
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
			</section>
		</SubSectionInnerContainer>
	</SubSectionOuterContainer>
</SectionOuterContainer>