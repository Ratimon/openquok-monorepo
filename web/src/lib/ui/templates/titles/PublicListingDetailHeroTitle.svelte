<script lang="ts">
	import { cn } from '$lib/ui/helpers/common';

	import PublicHeroTitle from '$lib/ui/templates/titles/PublicHeroTitle.svelte';

	type Props = {
		title: string;
		headingId?: string;
		class?: string;
	};

	let { title, headingId, class: className = '' }: Props = $props();
</script>

<PublicHeroTitle
	{title}
	{headingId}
	class={cn('text-3xl sm:text-4xl lg:text-4xl', className)}
/>
