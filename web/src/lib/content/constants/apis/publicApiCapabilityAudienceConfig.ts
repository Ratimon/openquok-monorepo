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
		iconName: icons.Sparkles.name,
		iconClass: 'text-emerald-400',
		title: 'Vibe coders',
		description:
			'Connect your own social accounts in OpenQuok Cloud. Complete OAuth for each channel yourself. Then publish with curl, the Node SDK, MCP, or CLI. Draft JSON in the payload validator.',
		containerClass: AUDIENCE_CARD_CONTAINER_CLASS
	},
	{
		iconName: icons.Code.name,
		iconClass: 'text-lime-400',
		title: 'CLI and SDK users',
		description:
			'Call POST /public/posts from a script or CI job. One opo_ token covers every channel you connected. Your plan still caps channels and posts per month.',
		containerClass: AUDIENCE_CARD_CONTAINER_CLASS
	},
	{
		iconName: icons.Rocket.name,
		iconClass: 'text-rose-400',
		title: 'Agent operators',
		description:
			'Point Cursor, Claude Code, or another MCP host at your workspace. The agent posts only to accounts you already authorized.',
		containerClass: AUDIENCE_CARD_CONTAINER_CLASS
	}
];

const SCHEDULING_HUB_CARDS: readonly AudienceCard[] = [
	{
		iconName: icons.Sparkles.name,
		iconClass: 'text-emerald-400',
		title: 'Vibe coders',
		description:
			'Connect your channels in OpenQuok Cloud. Complete OAuth in the dashboard. Then set scheduledAt with curl, the Node SDK, MCP, or CLI. UTC timestamps stay predictable in JSON.',
		containerClass: AUDIENCE_CARD_CONTAINER_CLASS
	},
	{
		iconName: icons.Code.name,
		iconClass: 'text-lime-400',
		title: 'CLI and SDK users',
		description:
			'Queue publish times in one REST call. OpenQuok delivers on the worker. You do not run cron per platform. Channel and post caps on your plan still apply.',
		containerClass: AUDIENCE_CARD_CONTAINER_CLASS
	},
	{
		iconName: icons.Rocket.name,
		iconClass: 'text-rose-400',
		title: 'Agent operators',
		description:
			'Ask your agent to schedule into your workspace. It uses the accounts you connected. It does not onboard other people’s customers onto your token.',
		containerClass: AUDIENCE_CARD_CONTAINER_CLASS
	}
];

const HUB_SECTION_BY_CAPABILITY: Record<PublicApiCapability, PublicApiAudienceSection> = {
	posting: {
		audienceSubtitle: 'Built for people who connect their own channels',
		audienceTitle: 'Who builds with,the posting API?',
		audienceCards: POSTING_HUB_CARDS
	},
	scheduling: {
		audienceSubtitle: 'Built for people who connect their own channels',
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
