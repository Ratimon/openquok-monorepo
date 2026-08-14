<script lang="ts">
	import type { Snippet } from 'svelte';
	import ExternalLink from '$lib/ui/components/ExternalLink.svelte';
	import { resolveExternalLinkPolicy } from '$lib/utils/externalLinkRel';

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
		/** Override auto policy from `resolveExternalLinkPolicy`. */
		trusted?: boolean;
		/** Override auto policy from `resolveExternalLinkPolicy`. */
		follow?: boolean;
		ariaLabel?: string;
	} = $props();

	const policy = $derived(resolveExternalLinkPolicy(href));
	const resolvedTrusted = $derived(trusted ?? policy.trusted);
	const resolvedFollow = $derived(follow ?? policy.follow);
</script>

<ExternalLink
	{href}
	trusted={resolvedTrusted}
	follow={resolvedFollow}
	{ariaLabel}
	class="not-prose font-medium text-primary underline decoration-primary/50 underline-offset-[3px] transition-colors hover:text-primary hover:decoration-primary {className}"
>
	{@render children()}
</ExternalLink>
