<script lang="ts" module>
	import type { IconName } from '$data/icons';
	import { icons } from '$data/icons';

	import { socialProviderIconByIdentifier } from '$data/social-providers';

	const iconMap: Record<string, IconName> = {
		...socialProviderIconByIdentifier,
		github: icons.Github.name,
		twitter: icons.X.name,
		x: icons.X.name,
		linkedin: icons.LinkedIn.name,
		facebook: icons.Facebook.name,
		instagram: icons.Instagram.name,
		discord: icons.Discord.name,
		slack: icons.MessageCircle.name,
		twitch: icons.Megaphone.name,
		mastodon: icons.Mastodon.name,
		rss: icons.List.name,
		mail: icons.Mail.name,
		email: icons.Mail.name,
		website: icons.House.name
	};

	export type SocialLink = {
		platform: string;
		url: string;
		label?: string;
		/** When set, used instead of looking up `platform` in the icon map. */
		icon?: IconName;
	};
</script>

<script lang="ts">
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import { cn } from '$lib/ui/helpers/common';
	import * as Tooltip from '$lib/ui/tooltip';
	import { externalLinkAnchorAttrs } from '$lib/utils/externalLinkRel';

	/** Match docs header controls (ThemeSwitcher, DocsLocaleSwitcher): base-200 hover, not ghost accent. */
	const headerIconHitClass = cn(
		'text-base-content/70 hover:bg-base-200 hover:text-base-content transition-colors outline-none',
		'inline-flex shrink-0 items-center justify-center'
	);

	let { links = [] }: { links: SocialLink[] } = $props();
</script>

{#each links as link}
	{@const iconName = link.icon ?? iconMap[link.platform.toLowerCase()]}
	{@const tip = link.label ?? link.platform.replace(/^\w/, (c) => c.toUpperCase())}
	{@const external = externalLinkAnchorAttrs(link.url)}
	{#if iconName}
		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props: triggerProps })}
					<span {...triggerProps} class="inline-flex">
						<Button
							variant="ghost"
							size="icon"
							class={headerIconHitClass}
							href={external.href}
							target={external.target}
							rel={external.rel}
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
