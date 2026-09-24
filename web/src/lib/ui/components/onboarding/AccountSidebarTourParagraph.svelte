<script lang="ts">
	import { page } from '$app/state';

	import type { AccountSidebarTourTextPart } from '$lib/onboarding/accountSidebarTour.types';
	import { hostedMarketingHref } from '$lib/utils/hostedMarketingHref';

	type Props = {
		parts: AccountSidebarTourTextPart[];
	};

	let { parts }: Props = $props();

	function partKey(part: AccountSidebarTourTextPart, index: number): string {
		if (typeof part === 'string') return `s-${index}-${part.slice(0, 24)}`;
		if ('highlight' in part) return `h-${index}-${part.highlight}`;
		return `l-${index}-${part.link.href}`;
	}

	function docHref(path: string): string {
		return hostedMarketingHref(path, page.url.origin);
	}
</script>

<p class="text-sm leading-relaxed text-base-content/80">
	{#each parts as part, i (partKey(part, i))}
		{#if typeof part === 'string'}
			{part}
		{:else if 'highlight' in part}
			<span class="rounded-sm bg-primary/15 px-1 py-0.5 font-semibold text-primary">
				{part.highlight}
			</span>
		{:else}
			<a
				class="link link-primary font-medium underline-offset-2"
				href={docHref(part.link.href)}
				target="_blank"
				rel="noopener"
			>
				{part.link.label}
			</a>
		{/if}
	{/each}
</p>
