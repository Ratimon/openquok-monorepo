<script lang="ts">
	import { cn } from '$lib/ui/helpers/common';
	import { icons } from '$data/icons';

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

	const SocialLinks = [
		{
			CHANNEL_ID: 'SOCIAL_LINKS_FACEBOOK',
			CHANNEL_NAME: 'Facebook',
			CHANNEL_HREF: 'https://www.facebook.com',
			Icon: icons.Facebook.name
		},
		{
			CHANNEL_ID: 'SOCIAL_LINKS_X',
			CHANNEL_NAME: 'X',
			CHANNEL_HREF: 'https://www.x.com',
			Icon: icons.X.name
		},
		{
			CHANNEL_ID: 'SOCIAL_LINKS_INSTAGRAM',
			CHANNEL_NAME: 'Instagram',
			CHANNEL_HREF: 'https://www.instagram.com',
			Icon: icons.Instagram.name
		},
		{
			CHANNEL_ID: 'SOCIAL_LINKS_YOUTUBE',
			CHANNEL_NAME: 'YouTube',
			CHANNEL_HREF: 'https://www.youtube.com',
			Icon: icons.YouTube.name
		}
	];
</script>

<div
	class={cn('flex gap-4', direction === 'horizontal' ? 'flex-row' : 'flex-col')}
	aria-label="Social links"
>
	{#each SocialLinks as link}
		{@const href = resolveSocialHref(link.CHANNEL_ID, link.CHANNEL_HREF)}
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
	{/each}
</div>
