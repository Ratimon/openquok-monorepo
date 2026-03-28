<script lang="ts" module>
	import type { IconName } from '$data/icon';
	import { icons } from '$data/icon';

	const iconMap: Record<string, IconName> = {
		github: icons.Github.name,
		twitter: icons.X.name,
		x: icons.X.name,
		facebook: icons.Facebook.name,
		instagram: icons.Instagram.name,
		linkedin: icons.Link.name,
		youtube: icons.YouTube.name,
		// to do: add discord, slack, twitch, mastodon, rss, mail, email, website icons
		discord: icons.MessageCircle.name,
		slack: icons.MessageCircle.name,
		twitch: icons.Megaphone.name,
		mastodon: icons.Mail.name,
		rss: icons.List.name,
		mail: icons.Mail.name,
		email: icons.Mail.name,
		website: icons.House.name
	};

	export type SocialLink = {
		platform: string;
		url: string;
		label?: string;
	};
</script>

<script lang="ts">
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import { cn } from '$lib/ui/helpers/common';
	import * as Tooltip from '$lib/ui/tooltip';

	/** Match docs header controls (ThemeSwitcher, DocsLocaleSwitcher): base-200 hover, not ghost accent. */
	const headerIconHitClass = cn(
		'text-base-content/70 hover:bg-base-200 hover:text-base-content transition-colors outline-none',
		'inline-flex shrink-0 items-center justify-center'
	);

	let { links = [] }: { links: SocialLink[] } = $props();
</script>

{#each links as link}
	{@const iconName = iconMap[link.platform.toLowerCase()]}
	{@const tip = link.label ?? link.platform.replace(/^\w/, (c) => c.toUpperCase())}
	{#if iconName}
		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props: triggerProps })}
					<span {...triggerProps} class="inline-flex">
						<Button
							variant="ghost"
							size="icon"
							class={headerIconHitClass}
							href={link.url}
							target="_blank"
							rel="noopener noreferrer"
							aria-label={link.label ?? link.platform}
						>
							<AbstractIcon name={iconName} class="size-4" width="16" height="16" />
						</Button>
					</span>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Content side="bottom" sideOffset={6}>{tip}</Tooltip.Content>
		</Tooltip.Root>
	{/if}
{/each}
