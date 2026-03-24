<script lang="ts">
	import type { PageData } from './$types';

	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { page } from '$app/state';

	import { getRootPathPublicBlog, getRootPathPublicBlogPost } from '$lib/area-public/constants/getRootPathPublicBlog';
	import BlogTopicsNavigation from '$lib/ui/components/blog-topics/BlogTopicsNavigation.svelte';
	import BlogPostCardHighlightedPublic from '$lib/ui/components/blog-public/BlogPostCardHighlightedPublic.svelte';
	import BlogPostCardPublic from '$lib/ui/components/blog-public/BlogPostCardPublic.svelte';
	import Pagination from '$lib/ui/templates/Pagination.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import { Card, CardContent } from '$lib/ui/card';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import SubSectionInnerContainer from '$lib/ui/layouts/SubSectionInnerContainer.svelte';
	import SubSectionOuterContainer from '$lib/ui/layouts/SubSectionOuterContainer.svelte';
	import { url } from '$lib/utils/path';

	/** From `en.ts` — blog.blog-topic-page */
	const TOPIC_NOT_FOUND = 'Topic Not Found';
	const VIEW_ALL_TOPICS = 'View All Topics';
	/** From `en.ts` — blog.blog-posts-overview-page.no-posts */
	const NO_POSTS = 'There are (yet) no published posts';

	type Props = {
		data: PageData;
	};

	let { data }: Props = $props();

	onMount(() => {
		if (!browser) return;
		if (!page.data.topic) {
			void goto(url('/not-found'), { replaceState: true });
		}
	});

	let topic = $derived(data.topic);
	let topicSlug = $derived(data.topicSlug);
	let posts = $derived(data.posts);
	let count = $derived(data.count);
	let topicsNav = $derived(data.topicsNav);
	let itemsPerPage = $derived(data.itemsPerPage);
	let listPage = $derived(data.page);

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

	const topicsOverviewHref = url(`/${getRootPathPublicBlog()}/topic`);

	let totalPages = $derived(Math.max(1, Math.ceil(count / Math.max(itemsPerPage, 1))));
	let firstPost = $derived(posts[0]);
	let restPosts = $derived(posts.slice(1));
</script>

<SectionOuterContainer class="bg-base-100">
	<SubSectionOuterContainer class="md:py-10">
		<SubSectionInnerContainer class="max-w-7xl py-8">
			<section class="flex flex-col gap-2">
				{#if !topic}
					<h1 class="mb-8 text-3xl font-bold">{TOPIC_NOT_FOUND}</h1>
				{:else}
					<div class="flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
						<div>
							<h1 class="mb-4 text-3xl font-bold">{topic.name}</h1>
							{#if topic.description}
								<p class="text-base-content/70 mb-8">{topic.description}</p>
							{/if}
						</div>
						<Button variant="outline" href={topicsOverviewHref}>{VIEW_ALL_TOPICS}</Button>
					</div>

					<BlogTopicsNavigation activeTopicSlug={topicSlug} class="my-8" topics={topicsNav} />

					{#if !posts.length}
						<Card>
							<CardContent class="p-6 text-center">
								<p class="text-base-content/80">{NO_POSTS}</p>
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
