<script lang="ts">
	import type { BlogTopicOverviewPublicViewModel } from '$lib/blogs/GetBlog.presenter.svelte';
	import { getRootPathPublicBlog } from '$lib/area-public/constants/getRootPathPublicBlog';
	import { cn } from '$lib/ui/helpers/common';
	import { url } from '$lib/utils/path';
	
	import { Badge } from '$lib/ui/badge';
	

	// /blog
	const rootPathPublicBlog = getRootPathPublicBlog();
	const blogIndexHref = url(`/${rootPathPublicBlog}`);

	type Props = {
		topics: BlogTopicOverviewPublicViewModel[];
		activeTopicSlug?: string | null;
		class?: string;
	};

	let { topics, activeTopicSlug = null, class: className = '' }: Props = $props();

	let totalPosts = $derived(topics.reduce((acc, topic) => acc + Number(topic.postCount), 0));

	const baseChipClass =
		'cursor-pointer border-amber-200/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/50';

	function topicChipClass(isActive: boolean): string {
		return cn(
			baseChipClass,
			isActive
				? 'bg-amber-200/15 text-amber-200 hover:bg-amber-200/20 hover:text-amber-100'
				: 'bg-transparent text-amber-200/85 hover:bg-amber-200/10 hover:text-amber-100'
		);
	}
</script>

{#if topics.length}
	<nav
		class={cn('flex flex-wrap gap-2', className)}
		aria-label="Blog topics navigation"
	>
		<Badge
			href={blogIndexHref}
			variant={!activeTopicSlug ? 'default' : 'outline'}
			ariaCurrent={!activeTopicSlug ? 'page' : undefined}
			class={topicChipClass(!activeTopicSlug)}
		>
			<span class="sr-only">All topics with </span>
			All ({totalPosts})<span class="sr-only"> blog posts</span>
		</Badge>
		{#each topics as topic (topic.id)}
			<Badge
				href={url(`/${rootPathPublicBlog}/topic/${topic.slug}`)}
				variant={activeTopicSlug === topic.slug ? 'default' : 'outline'}
				ariaCurrent={activeTopicSlug === topic.slug ? 'page' : undefined}
				class={topicChipClass(activeTopicSlug === topic.slug)}
			>
				<span class="sr-only">Topic </span>
				{topic.name} ({topic.postCount})
				<span class="sr-only"> blog posts</span>
			</Badge>
		{/each}
	</nav>
{/if}
