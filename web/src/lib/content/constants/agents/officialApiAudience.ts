import type { AudienceCard } from '$lib/ui/templates/WhoIsFor.svelte';
import { icons } from '$data/icons';

import { PUBLIC_AGENT_HOST_LANDING_PAGES } from '$lib/content/constants/agents/seeds';

const CARD_CONTAINER_CLASS = 'h-full min-h-[18rem]';

export const OFFICIAL_API_AGENT_HOST_AUDIENCE_TITLE = 'Creators who fear platform bans';

const PUBLIC_AGENT_HOST_SLUGS = new Set(
	PUBLIC_AGENT_HOST_LANDING_PAGES.map((page) => page.slug.trim().toLowerCase())
);

function normalizeSlug(slug: string): string {
	return slug.trim().toLowerCase();
}

export function getAgentLabelForHostSlug(hostSlug: string): string | undefined {
	return PUBLIC_AGENT_HOST_LANDING_PAGES.find(
		(page) => page.slug === normalizeSlug(hostSlug)
	)?.agentLabel;
}

function hasOfficialApiAudienceCard(cards: readonly AudienceCard[]): boolean {
	return cards.some((card) => {
		const title = card.title.trim();
		if (title === OFFICIAL_API_AGENT_HOST_AUDIENCE_TITLE) return true;
		if (title.includes('who fear platform bans')) return true;
		if (title.includes('who avoid policy strikes')) return true;
		if (title.includes('who avoid ban risk')) return true;
		if (title.includes('who publish on official APIs')) return true;
		if (title.includes('on official APIs')) return true;
		return false;
	});
}

/** Shared WhoIsFor card for `/agents/{slug}` — official APIs vs browser passwords in agent chat. */
export function buildOfficialApiAgentHostAudienceCard(agentLabel?: string): AudienceCard {
	const tail = agentLabel
		? ` Message ${agentLabel} to draft. You approve on OpenQuok before anything goes live.`
		: ' You approve on OpenQuok before anything goes live.';
	return {
		iconName: icons.ShieldCheck.name,
		iconClass: 'text-stone-400',
		title: OFFICIAL_API_AGENT_HOST_AUDIENCE_TITLE,
		description: `OpenQuok uses official platform APIs, not passwords in agent chat. The stack is open source. Human approval cuts ban risk from scripted logins.${tail}`,
		containerClass: CARD_CONTAINER_CLASS
	};
}

type ChannelSafetyAudienceTailoring = {
	title: string;
	lead: string;
	/** Reddit and similar paths use extension autofill + human submit, not platform OAuth publish. */
	mode: 'official-api' | 'human-handoff';
};

const CHANNEL_SAFETY_AUDIENCE_TAILORING: Partial<Record<string, ChannelSafetyAudienceTailoring>> = {
	reddit: {
		mode: 'human-handoff',
		title: 'Reddit posters who avoid ban risk',
		lead: 'No server publish. The extension autofills reddit.com. You click Post yourself.'
	},
	facebook: {
		mode: 'official-api',
		title: 'Facebook creators who avoid policy strikes',
		lead: 'Queue Page posts through Meta’s Graph API with OAuth you control—not Facebook passwords in agent chat.'
	},
	instagram: {
		mode: 'official-api',
		title: 'Instagram creators who avoid restrictions',
		lead: 'Publish with Meta’s official Instagram APIs after you connect the account in OpenQuok.'
	},
	threads: {
		mode: 'official-api',
		title: 'Threads publishers on official Meta APIs',
		lead: 'Threads posts use Meta’s supported publishing path with tokens kept off the agent computer.'
	},
	tiktok: {
		mode: 'official-api',
		title: 'TikTok creators who skip risky automation',
		lead: 'Content Posting API after OAuth. Not browser logins that trigger bans.'
	},
	x: {
		mode: 'official-api',
		title: 'X publishers who stay within API rules',
		lead: 'Post through X’s official APIs with encrypted tokens on OpenQuok, not credentials pasted into chat.'
	},
	youtube: {
		mode: 'official-api',
		title: 'YouTube creators on supported upload APIs',
		lead: 'Schedule uploads through Google’s YouTube APIs after you connect the channel once.'
	},
	linkedin: {
		mode: 'official-api',
		title: 'LinkedIn marketers on Marketing API paths',
		lead: 'Company and profile posts use LinkedIn’s official integration—not scripted browser sessions.'
	},
	bluesky: {
		mode: 'official-api',
		title: 'Bluesky publishers with credentials off-chat',
		lead: 'Connect Bluesky in OpenQuok. App credentials stay in your workspace while the agent drafts.'
	}
};

/** Tailored WhoIsFor card for `/agents/{host}/{channel}` — official APIs or human handoff, plus agent hook. */
export function buildOfficialApiAgentChannelAudienceCard(
	channelSlug: string,
	platformLabel: string,
	agentLabel: string
): AudienceCard {
	const tailored = CHANNEL_SAFETY_AUDIENCE_TAILORING[normalizeSlug(channelSlug)];
	const title = tailored?.title ?? `${platformLabel} creators who publish on official APIs`;
	const lead =
		tailored?.lead ??
		`OpenQuok schedules ${platformLabel} through official APIs with OAuth you approve in your workspace—not browser hacks in ${agentLabel} chat.`;
	const tail =
		tailored?.mode === 'human-handoff'
			? ` Message ${agentLabel} to draft for due slots.`
			: ` Message ${agentLabel} to draft. You approve before publish.`;
	return {
		iconName: icons.ShieldCheck.name,
		iconClass: 'text-stone-400',
		title,
		description: `${lead}${tail}`,
		containerClass: CARD_CONTAINER_CLASS
	};
}

export function appendOfficialApiAgentHostAudienceCard(
	baseCards: readonly AudienceCard[],
	hostSlug: string,
	agentLabel?: string
): AudienceCard[] {
	if (!PUBLIC_AGENT_HOST_SLUGS.has(normalizeSlug(hostSlug))) return [...baseCards];
	if (hasOfficialApiAudienceCard(baseCards)) return [...baseCards];
	return [...baseCards, buildOfficialApiAgentHostAudienceCard(agentLabel)];
}

/** Agent × channel slugs where seed tailoring already covers official-API / ban safety. */
export const AGENT_CHANNEL_OFFICIAL_API_EMBEDDED_SLUGS = new Set(['tiktok']);

export function shouldSkipOfficialApiAgentChannelCard(channelSlug: string): boolean {
	return AGENT_CHANNEL_OFFICIAL_API_EMBEDDED_SLUGS.has(normalizeSlug(channelSlug));
}

export function appendOfficialApiAgentChannelAudienceCard(
	baseCards: readonly AudienceCard[],
	channelSlug: string,
	platformLabel: string,
	agentLabel: string
): AudienceCard[] {
	if (shouldSkipOfficialApiAgentChannelCard(channelSlug)) return [...baseCards];
	if (hasOfficialApiAudienceCard(baseCards)) return [...baseCards];
	return [...baseCards, buildOfficialApiAgentChannelAudienceCard(channelSlug, platformLabel, agentLabel)];
}