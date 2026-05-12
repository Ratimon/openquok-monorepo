<script lang="ts">
	import { Card, CardDescription, CardHeader, CardTitle } from '$lib/ui/card/index.js';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import ExternalLink from '$lib/ui/components/ExternalLink.svelte';

	let {
		title,
		description,
		href,
		trusted,
		follow
	}: {
		title: string;
		description?: string;
		href: string;
		trusted?: boolean;
		follow?: boolean;
	} = $props();

	const isExternal = $derived(/^https?:\/\//i.test(href));
</script>

{#snippet cardBody()}
	<Card
		class="border-base-300 hover:border-primary/30 hover:bg-base-200/40 group transition-colors"
	>
		<CardHeader>
			<div class="flex items-center justify-between">
				<CardTitle>{title}</CardTitle>
				<AbstractIcon
					name={isExternal ? 'Link' : 'ArrowRight'}
					class="text-base-content/50 group-hover:text-base-content size-4 shrink-0 transition-transform {isExternal
						? ''
						: 'group-hover:translate-x-0.5'}"
					width="16"
					height="16"
				/>
			</div>
			{#if description}
				<CardDescription>{description}</CardDescription>
			{/if}
		</CardHeader>
	</Card>
{/snippet}

{#if isExternal}
	<ExternalLink {href} {trusted} {follow} class="not-prose no-underline block">
		{@render cardBody()}
	</ExternalLink>
{:else}
	<a {href} class="not-prose no-underline block">
		{@render cardBody()}
	</a>
{/if}
