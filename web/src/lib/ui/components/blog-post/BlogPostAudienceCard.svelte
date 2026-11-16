<script lang="ts">
	import type { BlogSeoAudienceCard } from '$lib/blogs/blog.types';

	import { blogAudienceCardToAudienceCard } from '$lib/blogs/utils/blogAudienceCard';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		audienceCard: BlogSeoAudienceCard;
		class?: string;
	};

	let { audienceCard, class: className = '' }: Props = $props();

	const display = $derived(blogAudienceCardToAudienceCard(audienceCard));
	const headingId = 'blog-post-audience-title';
</script>

<section id="blog-post-audience" class={className} aria-labelledby={headingId}>
	<div
		class="flex gap-4 rounded-xl border border-base-300 bg-base-200/40 p-4 sm:p-5"
	>
		<AbstractIcon
			name={display.iconName}
			class="h-10 w-10 shrink-0 sm:h-11 sm:w-11 {display.iconClass}"
			width="44"
			height="44"
		/>
		<div class="min-w-0 space-y-2 text-left">
			<h2
				id={headingId}
				class="text-lg font-semibold tracking-tight text-base-content sm:text-xl"
			>
				<span class="font-medium text-base-content/65">This blog is for</span>
				{' '}
				<span>{display.title}</span>
			</h2>
			<p class="text-sm leading-relaxed text-base-content/80 sm:text-base">
				{display.description}
			</p>
		</div>
	</div>
</section>