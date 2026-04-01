<script lang="ts">
	import type { Snippet } from 'svelte';
	import ExternalLink from '$lib/ui/components/ExternalLink.svelte';

	let {
		href,
		children,
		class: className = '',
		trusted,
		follow,
		ariaLabel
	}: {
		href: string;
		children: Snippet;
		class?: string;
		trusted?: boolean;
		follow?: boolean;
		ariaLabel?: string;
	} = $props();
</script>

<ExternalLink
	{href}
	{trusted}
	{follow}
	{ariaLabel}
	class="not-prose font-medium text-primary underline decoration-primary/50 underline-offset-[3px] transition-colors hover:text-primary hover:decoration-primary {className}"
>
	{@render children()}
</ExternalLink>
