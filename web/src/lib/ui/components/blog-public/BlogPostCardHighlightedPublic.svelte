<script lang="ts">
	import type { BlogPostPublicViewModel } from '$lib/blog/index';
	import FormattedISODate from '$lib/ui/components/FormattedISODate.svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/ui/card';
	import SupabaseImage from '$lib/ui/supabase/SupabaseImage.svelte';

	type Props = {
		post: BlogPostPublicViewModel;
		href: string;
	};

	let { post, href }: Props = $props();

	const minutes = $derived(post.readingTimeMinutes ?? 0);
	const readingLabel = $derived(`${minutes} min read`);
</script>

<a {href} class="block">
	<Card
		data-testid="highlighted-blog-post-card"
		class="transition-all hover:bg-base-200"
	>
		<div class="grid gap-6 lg:grid-cols-2">
			{#if post.heroImageFilename}
				<SupabaseImage
					dbImageUrl={post.heroImageFilename}
					database="blog_images"
					width={900}
					height={600}
					class="relative aspect-video w-full overflow-hidden rounded-t-lg bg-base-200 lg:aspect-auto lg:h-full lg:rounded-l-lg lg:rounded-tr-none"
					imageAlt="Featured image for blog post: {post.title}"
				/>
			{:else}
				<div
					class="relative aspect-video w-full rounded-t-lg bg-base-200 lg:aspect-auto lg:h-full lg:rounded-l-lg lg:rounded-tr-none"
				></div>
			{/if}
			<div class="flex flex-col justify-center p-6">
				<CardHeader class="p-0">
					<div class="mb-4 flex flex-wrap items-center gap-2">
						<span class="badge badge-outline">{readingLabel}</span>
						{#if post.isSponsored}
							<span class="badge badge-secondary">Sponsored</span>
						{/if}
						<FormattedISODate date={post.createdAt} class="text-base-content/60 text-xs" />
					</div>
					<CardTitle class="mb-4 text-3xl">{post.title}</CardTitle>
				</CardHeader>
				<CardContent class="p-0">
					<p class="text-base-content/70 line-clamp-4">
						{post.description ?? ''}
					</p>
				</CardContent>
			</div>
		</div>
	</Card>
</a>
