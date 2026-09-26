<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';

	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		href?: string;
		onActivate?: () => void;
		class?: ClassValue;
		children: Snippet;
		'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | boolean | undefined;
	};

	let { href, onActivate, class: className, children, 'aria-current': ariaCurrent }: Props =
		$props();
</script>

{#if onActivate}
	<button type="button" class={cn(className, 'w-full cursor-pointer text-left')} onclick={onActivate}>
		{@render children()}
	</button>
{:else if href}
	<a {href} class={className} aria-current={ariaCurrent}>
		{@render children()}
	</a>
{:else}
	<article class={className}>
		{@render children()}
	</article>
{/if}
