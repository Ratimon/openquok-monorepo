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
			'Embed multi-platform posting in your app without OAuth apps for every network. One programmatic token and POST /public/posts reach every connected channel.',
		containerClass: AUDIENCE_CARD_CONTAINER_CLASS
	},
	{
		iconName: icons.Sparkles.name,
		iconClass: 'text-emerald-400',
		title: 'Vibe coders',
		description:
			'Wire curl, the Node SDK, MCP, or CLI in an afternoon. Draft payloads in the validator, then publish from scripts or agents.',
		containerClass: AUDIENCE_CARD_CONTAINER_CLASS
	},
	{
		iconName: icons.Rocket.name,
		iconClass: 'text-rose-400',
		title: 'Startup teams',
		description:
			'Ship social publishing before you hire an integrations squad. Connect channels once in OpenQuok Cloud and keep OAuth out of your codebase.',
		containerClass: AUDIENCE_CARD_CONTAINER_CLASS
	}
];

const SCHEDULING_HUB_CARDS: readonly AudienceCard[] = [
	{
		iconName: icons.Code.name,
		iconClass: 'text-lime-400',
		title: 'SaaS developers',
		description:
			'Add queue-and-publish scheduling to your product without cron jobs per platform. Set scheduledAt once and OpenQuok delivers on time.',
		containerClass: AUDIENCE_CARD_CONTAINER_CLASS
	},
	{
		iconName: icons.Sparkles.name,
		iconClass: 'text-emerald-400',
		title: 'Vibe coders',
		description:
			'Schedule from curl, SDK, MCP, or CLI the same day you connect channels. Repeat intervals and UTC timestamps stay predictable in JSON.',
		containerClass: AUDIENCE_CARD_CONTAINER_CLASS
	},
	{
		iconName: icons.Rocket.name,
		iconClass: 'text-rose-400',
		title: 'Startup teams',
		description:
			'Launch calendar features before platform integrations become a roadmap blocker. Connect once, queue posts, and track delivery through one API.',
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
