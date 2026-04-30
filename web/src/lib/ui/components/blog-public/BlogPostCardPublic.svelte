<script lang="ts">
	import type { BlogPostPublicViewModel } from '$lib/blogs/index';
	import FormattedISODate from '$lib/ui/components/FormattedISODate.svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/ui/card';
	import { cn } from '$lib/ui/helpers/common';
	import SupabaseImage from '$lib/ui/supabase/SupabaseImage.svelte';

	type Props = {
		post: BlogPostPublicViewModel;
		href: string;
	};

	let { post, href }: Props = $props();

	const minutes = $derived(post.readingTimeMinutes ?? 0);
	const readingLabel = $derived(`${minutes} min read`);
</script>

<article>
	<a
		{href}
		class="group block rounded-t-lg focus-visible:ring-primary focus-visible:ring-2 focus-visible:outline-none"
		aria-labelledby={`blog-post-${post.id}-title`}
	>
		<Card
			data-testid="blog-post-card"
			class={cn(
				'h-full rounded-t-lg transition-all group-hover:bg-base-200 group-focus-visible:bg-base-200',
				post.isFeatured && 'border-primary bg-base-200 border-2'
			)}
		>
			{#if post.heroImageFilename}
				<SupabaseImage
					dbImageUrl={post.heroImageFilename}
					database="blog_images"
					width={900}
					height={600}
					class="relative aspect-video w-full overflow-hidden rounded-t-lg bg-base-200"
					imageAlt="Featured image for blog post: {post.title}"
				/>
			{:else}
				<div class="relative aspect-video w-full rounded-t-lg bg-base-200"></div>
			{/if}
			<CardHeader>
				<div class="mb-1 flex flex-wrap items-center justify-between gap-2">
					<time class="text-base-content/60 text-xs" datetime="PT{minutes}M">{readingLabel}</time>
					<FormattedISODate date={post.createdAt} class="text-base-content/60 text-xs" />
				</div>
				<CardTitle id={`blog-post-${post.id}-title`} class="line-clamp-2 min-h-12 leading-6">
					{post.title}
					{#if post.isSponsored}
						<span class="badge badge-secondary ml-1 align-middle text-xs" aria-label="Sponsored content"
							>Sponsored</span
						>
					{/if}
				</CardTitle>
			</CardHeader>
			<CardContent class="-mt-2">
				<p
					class="text-base-content/70 line-clamp-3 min-h-[4.5rem] text-sm leading-6"
					aria-label="Blog post description"
				>
					{post.description ?? ''}
				</p>
			</CardContent>
		</Card>
	</a>
</article>
