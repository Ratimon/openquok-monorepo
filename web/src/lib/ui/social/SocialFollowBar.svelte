<script lang="ts">
	import {
		SOCIAL_FOLLOW_BAR_LINKS,
		getSocialProfileHref
	} from '$lib/config/constants/config';
	import { cn } from '$lib/ui/helpers/common';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import ExternalLink from '$lib/ui/components/ExternalLink.svelte';

	type Props = {
		direction?: 'horizontal' | 'vertical';
		size?: 'sm' | 'lg';
		class?: string;
	};

	let {
		direction = 'horizontal',
		size = 'sm',
		class: className = ''
	}: Props = $props();
</script>

<div
	class={cn('flex gap-4', direction === 'horizontal' ? 'flex-row' : 'flex-col')}
	aria-label="Social links"
>
	{#each SOCIAL_FOLLOW_BAR_LINKS as link (link.CHANNEL_ID)}
		{@const href = getSocialProfileHref(link.CHANNEL_ID)}
		{#if href}
			<ExternalLink
				{href}
				ariaLabel={`Follow us on ${link.CHANNEL_NAME}`}
				trusted
				follow
				class={className}
			>
				{#if size === 'sm'}
					<span class="sr-only">
						{`Follow us on ${link.CHANNEL_NAME}`}
					</span>
					<AbstractIcon name={link.Icon} width="20" height="20" />
				{:else}
					{link.CHANNEL_NAME}: {href}
				{/if}
			</ExternalLink>
		{/if}
	{/each}
</div>
