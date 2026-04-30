<script lang="ts">
	import type { BlogTopicOverviewPublicViewModel } from '$lib/blogs/GetBlog.presenter.svelte';
	import { getRootPathPublicBlog } from '$lib/area-public/constants/getRootPathPublicBlog';
	import { Badge } from '$lib/ui/badge';
	import { cn } from '$lib/ui/helpers/common';
	import { url } from '$lib/utils/path';

	type Props = {
		topics: BlogTopicOverviewPublicViewModel[];
		activeTopicSlug?: string | null;
		class?: string;
	};

	let { topics, activeTopicSlug = null, class: className = '' }: Props = $props();

	const blogRoot = getRootPathPublicBlog();
	const blogIndexHref = url(`/${blogRoot}`);

	let totalPosts = $derived(topics.reduce((acc, topic) => acc + Number(topic.postCount), 0));

	const chipClass =
		'cursor-pointer hover:bg-primary/90 hover:text-primary-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';
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
			class={chipClass}
		>
			<span class="sr-only">All topics with </span>
			All ({totalPosts})<span class="sr-only"> blog posts</span>
		</Badge>
		{#each topics as topic (topic.id)}
			<Badge
				href={url(`/${blogRoot}/topic/${topic.slug}`)}
				variant={activeTopicSlug === topic.slug ? 'default' : 'outline'}
				ariaCurrent={activeTopicSlug === topic.slug ? 'page' : undefined}
				class={chipClass}
			>
				<span class="sr-only">Topic </span>
				{topic.name} ({topic.postCount})
				<span class="sr-only"> blog posts</span>
			</Badge>
		{/each}
	</nav>
{/if}
