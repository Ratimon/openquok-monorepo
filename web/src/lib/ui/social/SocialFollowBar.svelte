<script lang="ts">
	import { cn } from '$lib/ui/helpers/common';
	import { SOCIAL_FOLLOW_BAR_LINKS } from '$lib/ui/social/socialLinks';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import ExternalLink from '$lib/ui/components/ExternalLink.svelte';

	type Props = {
		marketingInformationVm?: Record<string, string>;
		direction?: 'horizontal' | 'vertical';
		size?: 'sm' | 'lg';
		class?: string;
	};

	let {
		marketingInformationVm = {},
		direction = 'horizontal',
		size = 'sm',
		class: className = ''
	}: Props = $props();

	function resolveSocialHref(channelId: string, fallback: string): string {
		const raw = marketingInformationVm[channelId];
		return typeof raw === 'string' && raw.trim() !== '' ? raw.trim() : fallback;
	}
</script>

<div
	class={cn('flex gap-4', direction === 'horizontal' ? 'flex-row' : 'flex-col')}
	aria-label="Social links"
>
	{#each SOCIAL_FOLLOW_BAR_LINKS as link (link.CHANNEL_ID)}
		{@const href = resolveSocialHref(link.CHANNEL_ID, link.CHANNEL_HREF)}
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
