<script lang="ts">
	import { Card, CardDescription, CardHeader, CardTitle } from '$lib/ui/card/index.js';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	let {
		title,
		description,
		href
	}: {
		title: string;
		description?: string;
		href: string;
	} = $props();
</script>
<a {href} class="not-prose no-underline">
	<Card
		class="border-base-300 hover:border-primary/30 hover:bg-base-200/40 group transition-colors"
	>
		<CardHeader>
			<div class="flex items-center justify-between">
				<CardTitle>{title}</CardTitle>
				<AbstractIcon
					name="ArrowRight"
					class="text-base-content/50 group-hover:text-base-content size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
					width="16"
					height="16"
				/>
			</div>
			{#if description}
				<CardDescription>{description}</CardDescription>
			{/if}
		</CardHeader>
	</Card>
</a>
