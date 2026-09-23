import type { AudienceCard } from '$lib/ui/templates/WhoIsFor.svelte';
import { icons } from '$data/icons';

const CARD_CONTAINER_CLASS = 'h-full min-h-[18rem]';

export const PUBLIC_SELF_HOSTING_WHO_IS_FOR_CARDS: readonly AudienceCard[] = [
	{
		iconName: icons.Cog.name,
		iconClass: 'text-emerald-400',
		title: 'Operators',
		description:
			'You run Docker Compose or a split stack on your cloud. You own backups, TLS, and upgrades. OpenQuok has no software fee under AGPL.',
		containerClass: CARD_CONTAINER_CLASS
	},
	{
		iconName: icons.CustomizedDrawnHouse.name,
		iconClass: 'text-lime-400',
		title: 'Teams with data control',
		description:
			'You need posts and tokens on infrastructure you choose. Self-host keeps scheduling in your VPC or on-prem instead of a shared SaaS tenant.',
		containerClass: CARD_CONTAINER_CLASS
	},
	{
		iconName: icons.CustomizedDrawnLaptop.name,
		iconClass: 'text-rose-400',
		title: 'Developers',
		description:
			'You want the same public API, SDK, MCP, and CLI as cloud. You register OAuth apps with each network and wire env vars on your API host.',
		containerClass: CARD_CONTAINER_CLASS
	}
];

export const PUBLIC_SELF_HOSTING_WHO_IS_FOR_SECTION = {
	audienceSubtitle: 'Built for people who run their own stack',
	audienceTitle: 'Who self-hosts,OpenQuok?',
	audienceCards: PUBLIC_SELF_HOSTING_WHO_IS_FOR_CARDS
} as const;
