import type { AudienceCard } from '$lib/ui/templates/WhoIsFor.svelte';
import type { PublicApiCapability } from '$lib/content/constants/apis/types';
import { icons } from '$data/icons';

export type PublicApiAudienceSection = {
	audienceSubtitle: string;
	audienceTitle: string;
	audienceCards: readonly AudienceCard[];
};

const AUDIENCE_CARD_CONTAINER_CLASS = 'h-full min-h-[18rem]';

const POSTING_HUB_CARDS: readonly AudienceCard[] = [
	{
		iconName: icons.Code.name,
		iconClass: 'text-lime-400',
		title: 'SaaS developers',
		description:
			'Add multi-platform posting to your Next.js or TypeScript backend with one REST API. One programmatic token powers POST /public/posts to every connected channel. Do not register OAuth for each network.',
		containerClass: AUDIENCE_CARD_CONTAINER_CLASS
	},
	{
		iconName: icons.Sparkles.name,
		iconClass: 'text-emerald-400',
		title: 'Vibe coders',
		description:
			'Use curl, the Node SDK, MCP, or CLI in one session. Draft JSON in the payload validator. Publish from TypeScript scripts or AI agents.',
		containerClass: AUDIENCE_CARD_CONTAINER_CLASS
	},
	{
		iconName: icons.Rocket.name,
		iconClass: 'text-rose-400',
		title: 'Startup teams',
		description:
			'Ship social publishing before you hire a backend integrations team. Connect channels once in OpenQuok Cloud. Keep OAuth out of your Next.js or TypeScript app.',
		containerClass: AUDIENCE_CARD_CONTAINER_CLASS
	}
];

const SCHEDULING_HUB_CARDS: readonly AudienceCard[] = [
	{
		iconName: icons.Code.name,
		iconClass: 'text-lime-400',
		title: 'SaaS developers',
		description:
			'Add post scheduling to your Next.js or TypeScript backend with one REST API. Set scheduledAt once. OpenQuok delivers on time. Do not run cron jobs per platform.',
		containerClass: AUDIENCE_CARD_CONTAINER_CLASS
	},
	{
		iconName: icons.Sparkles.name,
		iconClass: 'text-emerald-400',
		title: 'Vibe coders',
		description:
			'Schedule with curl, the Node SDK, MCP, or CLI the same day you connect channels. UTC timestamps and repeat intervals stay predictable in JSON.',
		containerClass: AUDIENCE_CARD_CONTAINER_CLASS
	},
	{
		iconName: icons.Rocket.name,
		iconClass: 'text-rose-400',
		title: 'Startup teams',
		description:
			'Launch calendar features before platform work blocks your roadmap. Connect once, queue posts, and track delivery through one REST API.',
		containerClass: AUDIENCE_CARD_CONTAINER_CLASS
	}
];

const HUB_SECTION_BY_CAPABILITY: Record<PublicApiCapability, PublicApiAudienceSection> = {
	posting: {
		audienceSubtitle: 'Built for API-first teams',
		audienceTitle: 'Who builds with,the posting API?',
		audienceCards: POSTING_HUB_CARDS
	},
	scheduling: {
		audienceSubtitle: 'Built for API-first teams',
		audienceTitle: 'Who builds with,the scheduling API?',
		audienceCards: SCHEDULING_HUB_CARDS
	}
};

function appendPlatformHook(description: string, platformLabel: string, capability: PublicApiCapability): string {
	const base = description.trim().replace(/\.$/, '');
	const verb = capability === 'posting' ? 'Publish' : 'Schedule';
	return `${base}. ${verb} to ${platformLabel} through the same request shape.`;
}

export function getPublicApiHubAudienceSection(capability: PublicApiCapability): PublicApiAudienceSection {
	return HUB_SECTION_BY_CAPABILITY[capability];
}

export function getPublicApiPlatformAudienceSection(
	capability: PublicApiCapability,
	platformLabel: string
): PublicApiAudienceSection {
	const hub = getPublicApiHubAudienceSection(capability);
	const title =
		capability === 'posting'
			? `Who publishes to,${platformLabel} via API?`
			: `Who schedules on,${platformLabel} via API?`;

	return {
		audienceSubtitle: hub.audienceSubtitle,
		audienceTitle: title,
		audienceCards: hub.audienceCards.map((card) => ({
			...card,
			description: appendPlatformHook(card.description, platformLabel, capability)
		}))
	};
}
