<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/ui/card/index.js';

	let {
		title,
		icon,
		children
	}: {
		title: string;
		icon?: string;
		children: Snippet;
	} = $props();
</script>

<Card class="not-prose border-base-300">
	<CardHeader>
		<CardTitle class="flex items-center gap-2">
			{#if icon}
				<span class="text-xl leading-none">{icon}</span>
			{/if}
			{title}
		</CardTitle>
	</CardHeader>
	<CardContent>
		<div class="text-base-content/70 text-sm">
			{@render children()}
		</div>
	</CardContent>
</Card>
