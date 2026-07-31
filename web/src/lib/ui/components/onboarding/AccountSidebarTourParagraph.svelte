<script lang="ts">
	import type { AccountSidebarTourTextPart } from '$lib/onboarding/accountSidebarTour.types';

	type Props = {
		parts: AccountSidebarTourTextPart[];
	};

	let { parts }: Props = $props();
</script>

<p class="text-sm leading-relaxed text-base-content/80">
	{#each parts as part (typeof part === 'string' ? part : part.highlight)}
		{#if typeof part === 'string'}
			{part}
		{:else}
			<span class="rounded-sm bg-primary/15 px-1 py-0.5 font-semibold text-primary">
				{part.highlight}
			</span>
		{/if}
	{/each}
</p>
