import type { AudienceCard } from '$lib/ui/templates/WhoIsFor.svelte';
import { icons } from '$data/icons';

import type { PublicAgentChannelHubLinkViewModel } from '$lib/content/constants/agents/channels/types';
import type { PublicFaqItem } from '$lib/content/constants/faq';
import { buildAgentHostPickerFaqDescription } from '$lib/content/constants/agents/decision-scenarios';
import {
	buildPublicAgentChannelSiblingGridHubDescription,
	buildPublicAgentChannelSiblingGridHubTitle
} from '$lib/content/utils/buildPublicChannelSiblingGridCopy';
import {
	buildAgentFaqLinks,
	faqLink,
	publicFaqHref
} from '$lib/content/utils/publicFaqLinks';

export type AgentHostEcosystemId = 'meta-consumer' | 'openai-personal-agents' | 'xai-grok';

export type AgentHostEcosystem = {
	id: AgentHostEcosystemId;
	firstClassChannelSlugs: readonly string[];
	relatedAgentSlugs: readonly string[];
	relatedMcpSlugs: readonly string[];
};

const CARD_CONTAINER_CLASS = 'h-full min-h-[18rem]';

/** Hub grid badge for ecosystem first-class channels. */
export const AGENT_HOST_FIRST_CLASS_CHANNEL_BADGE = 'First-class';

const ECOSYSTEM_PROFILES: Record<AgentHostEcosystemId, AgentHostEcosystem> = {
	'meta-consumer': {
		id: 'meta-consumer',
		firstClassChannelSlugs: ['facebook', 'instagram', 'threads'],
		relatedAgentSlugs: [],
		relatedMcpSlugs: ['muse-code']
	},
	'openai-personal-agents': {
		id: 'openai-personal-agents',
		firstClassChannelSlugs: [],
		relatedAgentSlugs: ['dots', 'openclaw'],
		relatedMcpSlugs: ['chatgpt']
	},
	'xai-grok': {
		id: 'xai-grok',
		firstClassChannelSlugs: ['x'],
		relatedAgentSlugs: [],
		relatedMcpSlugs: ['grok-build', 'cursor']
	}
};

/** Host slug → ecosystem id for vendor-aligned copy and grid ordering. */
export const AGENT_HOST_ECOSYSTEM_BY_SLUG: Readonly<Record<string, AgentHostEcosystemId>> = {
	openclaw: 'openai-personal-agents',
	dots: 'openai-personal-agents',
	'meta-muse': 'meta-consumer',
	'grok-bot': 'xai-grok'
};

/** MCP client slug → ecosystem id for WhoIsFor / first-class channel copy. */
export const MCP_CLIENT_ECOSYSTEM_BY_SLUG: Readonly<Record<string, AgentHostEcosystemId>> = {
	'muse-code': 'meta-consumer',
	'grok-build': 'xai-grok'
};

const audienceTailoredCardByHostSlug: Readonly<Record<string, AudienceCard>> = {
	'meta-muse': {
		iconName: icons.MetaMuse.name,
		iconClass: 'text-sky-400',
		title: 'Meta-owned channels first',
		description:
			'Facebook, Instagram, and Threads are first-class for Meta Muse. You can still schedule every other supported network from the same OpenQuok workspace.',
		containerClass: CARD_CONTAINER_CLASS
	},
	openclaw: {
		iconName: icons.OpenClaw.name,
		iconClass: 'text-emerald-400',
		title: 'Open source on your Gateway',
		description:
			'OpenAI’s personal agent direction includes Dots on managed cloud computers. OpenClaw stays open source and foundation-supported. You still self-host the Gateway and control credentials.',
		containerClass: CARD_CONTAINER_CLASS
	},
	dots: {
		iconName: icons.Dots.name,
		iconClass: 'text-lime-400',
		title: 'ChatGPT-native cloud computers',
		description:
			'Dots are always-on agents on OpenAI-managed cloud computers with plugins and workplace chat. Choose OpenClaw when you need a self-hosted Gateway instead.',
		containerClass: CARD_CONTAINER_CLASS
	},
	'grok-bot': {
		iconName: icons.GrokBot.name,
		iconClass: 'text-rose-400',
		title: 'X as your home network',
		description:
			'Grok Bot fits xAI’s cloud computer and many named Bots. X is first-class; connect other networks in OpenQuok when you need them.',
		containerClass: CARD_CONTAINER_CLASS
	}
};

const audienceTailoredCardByMcpSlug: Readonly<Record<string, AudienceCard>> = {
	'muse-code': {
		iconName: icons.MuseCode.name,
		iconClass: 'text-sky-400',
		title: 'Meta-owned channels first',
		description:
			'Facebook, Instagram, and Threads are first-class for Muse Code. You can still schedule every other supported network from the same OpenQuok workspace.',
		containerClass: CARD_CONTAINER_CLASS
	},
	'grok-build': {
		iconName: icons.GrokBuild.name,
		iconClass: 'text-rose-400',
		title: 'X as your home network',
		description:
			'Grok Build fits xAI’s terminal coding agent. X is first-class; connect other networks in OpenQuok when you need them.',
		containerClass: CARD_CONTAINER_CLASS
	}
};

function normalizeHostSlug(slug: string): string {
	return slug.trim().toLowerCase();
}

export function getAgentHostEcosystemId(hostSlug: string): AgentHostEcosystemId | undefined {
	return AGENT_HOST_ECOSYSTEM_BY_SLUG[normalizeHostSlug(hostSlug)];
}

export function getMcpClientEcosystemId(mcpSlug: string): AgentHostEcosystemId | undefined {
	return MCP_CLIENT_ECOSYSTEM_BY_SLUG[normalizeHostSlug(mcpSlug)];
}

function getLandingEcosystemId(slug: string): AgentHostEcosystemId | undefined {
	const key = normalizeHostSlug(slug);
	return AGENT_HOST_ECOSYSTEM_BY_SLUG[key] ?? MCP_CLIENT_ECOSYSTEM_BY_SLUG[key];
}

export function getAgentHostEcosystem(hostSlug: string): AgentHostEcosystem | undefined {
	const id = getLandingEcosystemId(hostSlug);
	return id ? ECOSYSTEM_PROFILES[id] : undefined;
}

function appendAudienceTailoredCard(
	baseCards: readonly AudienceCard[],
	tailored: AudienceCard | undefined
): AudienceCard[] {
	if (!tailored) return [...baseCards];
	if (baseCards.some((card) => card.title === tailored.title)) return [...baseCards];
	return [...baseCards, tailored];
}

/** Append optional fourth WhoIsFor card when the host maps to an ecosystem profile. */
export function resolveAgentHostAudienceCards(
	baseCards: readonly AudienceCard[],
	hostSlug: string
): AudienceCard[] {
	return appendAudienceTailoredCard(
		baseCards,
		audienceTailoredCardByHostSlug[normalizeHostSlug(hostSlug)]
	);
}

/** Append optional fourth WhoIsFor card when the MCP client maps to an ecosystem profile. */
export function resolveMcpClientAudienceCards(
	baseCards: readonly AudienceCard[],
	mcpSlug: string
): AudienceCard[] {
	return appendAudienceTailoredCard(
		baseCards,
		audienceTailoredCardByMcpSlug[normalizeHostSlug(mcpSlug)]
	);
}

function metaConsumerContrastFaqDescription(): string {
	return `${faqLink(publicFaqHref.metaMuseLanding, 'Meta Muse')} is Meta’s consumer personal agent on muse.ai and WhatsApp with Muse Secure VM. ${faqLink(publicFaqHref.museCodeLanding, 'Muse Code')} is the developer MCP client on dev.meta.ai. They are separate apps and subscriptions. Use the matching OpenQuok setup guide for each product.`;
}

function metaOwnedFirstClassChannelFaqDescription(agentSlug: string, docsPath: string, agentLabel: string): string {
	const links = buildAgentFaqLinks(agentSlug, docsPath);
	const fb = faqLink(links.agentChannel('facebook'), 'Facebook');
	const ig = faqLink(links.agentChannel('instagram'), 'Instagram');
	const threads = faqLink(links.agentChannel('threads'), 'Threads');
	return `Facebook, Instagram, and Threads are first-class ${agentLabel} channels on OpenQuok. Start with ${fb}, ${ig}, or ${threads}, then add other networks from the same workspace.`;
}

function xaiGrokSurfaceCompareFaqDescription(): string {
	const grokBot = faqLink(publicFaqHref.grokBotLanding, 'Grok Bot');
	const grokBuild = faqLink(publicFaqHref.grokBuildLanding, 'Grok Build');
	const cursor = faqLink(publicFaqHref.cursorLanding, 'Cursor');
	return `${grokBot} is an always-on teammate on xAI’s cloud computer. You message it from desktop or iOS. ${grokBuild} is xAI’s terminal coding agent. You connect OpenQuok over MCP in the shell. ${cursor} is OpenQuok inside Agent and Composer. Same workspace and approval flow. Pick Grok Bot for messaging-first volume. Pick Grok Build when you live in the terminal. Pick Cursor when you stay in the repo.`;
}

function xFirstClassChannelFaqDescription(agentSlug: string, docsPath: string, agentLabel: string): string {
	const xChannel = faqLink(buildAgentFaqLinks(agentSlug, docsPath).agentChannel('x'), 'X');
	return `${xChannel} is first-class for ${agentLabel} on OpenQuok. Connect other networks when your workflow needs them.`;
}

function buildOpenAiPersonalAgentsFaqItems(_hostSlug: string): PublicFaqItem[] {
	return [];
}

/** Tailored FAQ rows for ecosystem hosts — merge on the host VM without duplicating titles. */
export function buildAgentHostEcosystemFaqItems(hostSlug: string): PublicFaqItem[] {
	const slug = normalizeHostSlug(hostSlug);
	const ecosystemId = getAgentHostEcosystemId(slug);
	if (!ecosystemId) return [];

	if (ecosystemId === 'meta-consumer' && slug === 'meta-muse') {
		return [
			{
				title: 'How is Meta Muse different from Muse Code?',
				description: metaConsumerContrastFaqDescription()
			},
			{
				title: 'Which channels are first-class for Meta Muse?',
				description: metaOwnedFirstClassChannelFaqDescription(
					'meta-muse',
					'/docs/agent-setup-guides/meta-muse',
					'Meta Muse'
				)
			}
		];
	}

	if (ecosystemId === 'openai-personal-agents') {
		return buildOpenAiPersonalAgentsFaqItems(slug);
	}

	if (ecosystemId === 'xai-grok' && slug === 'grok-bot') {
		return [
			{
				title: 'How is Grok Bot different from Grok Build or Cursor?',
				description: xaiGrokSurfaceCompareFaqDescription()
			},
			{
				title: 'Which channel is first-class for Grok Bot?',
				description: `${xFirstClassChannelFaqDescription('grok-bot', '/docs/agent-setup-guides/grok-bot', 'Grok Bot')} Grok Bot runs on xAI’s cloud computer with many named Bots.`
			},
			{
				title: 'How does Grok Bot compare to OpenClaw or Dots?',
				description: buildAgentHostPickerFaqDescription('grok-bot')
			}
		];
	}

	return [];
}

/** Tailored FAQ rows for ecosystem MCP clients — merge on the MCP VM without duplicating titles. */
export function buildMcpClientEcosystemFaqItems(mcpSlug: string): PublicFaqItem[] {
	const slug = normalizeHostSlug(mcpSlug);

	if (slug === 'muse-code') {
		return [
			{
				title: 'How is Muse Code different from Meta Muse?',
				description: metaConsumerContrastFaqDescription()
			},
			{
				title: 'Which channels are first-class for Muse Code?',
				description: metaOwnedFirstClassChannelFaqDescription(
					'muse-code',
					'/docs/mcp-setup-guides/muse-code',
					'Muse Code'
				)
			}
		];
	}

	if (slug === 'grok-build') {
		return [
			{
				title: 'How is Grok Build different from Grok Bot or Cursor?',
				description: xaiGrokSurfaceCompareFaqDescription()
			},
			{
				title: 'Which channel is first-class for Grok Build?',
				description: xFirstClassChannelFaqDescription(
					'grok-build',
					'/docs/mcp-setup-guides/grok-build',
					'Grok Build'
				)
			}
		];
	}

	if (slug === 'cursor') {
		return [
			{
				title: 'How is Cursor different from Grok Bot or Grok Build?',
				description: xaiGrokSurfaceCompareFaqDescription()
			}
		];
	}

	return [];
}

export function isFirstClassChannelForHost(hostSlug: string, channelSlug: string): boolean {
	const id = getLandingEcosystemId(hostSlug);
	const ecosystem = id ? ECOSYSTEM_PROFILES[id] : undefined;
	if (!ecosystem) return false;
	const channel = channelSlug.trim().toLowerCase();
	return ecosystem.firstClassChannelSlugs.includes(channel);
}

function firstClassChannelAudienceHook(hostSlug: string, platformLabel: string): string {
	const slug = normalizeHostSlug(hostSlug);
	const ecosystemId = getLandingEcosystemId(slug);
	if (ecosystemId === 'meta-consumer') {
		if (slug === 'muse-code') {
			return `${platformLabel} is a first-class Muse Code channel on OpenQuok.`;
		}
		return `${platformLabel} is a first-class Meta Muse channel on OpenQuok.`;
	}
	if (ecosystemId === 'xai-grok') {
		if (slug === 'grok-build') {
			return `${platformLabel} is first-class for Grok Build on OpenQuok.`;
		}
		return `${platformLabel} is first-class for Grok Bot on OpenQuok.`;
	}
	return `${platformLabel} is a first-class channel for this host on OpenQuok.`;
}

/** WhoIsFor on agent × channel pages: host ecosystem card plus first-class hook on card 0. */
export function resolveAgentChannelAudienceCards(
	baseCards: readonly AudienceCard[],
	hostSlug: string,
	channelSlug: string,
	platformLabel: string
): AudienceCard[] {
	const withHostCard = resolveAgentHostAudienceCards(baseCards, hostSlug);
	if (!isFirstClassChannelForHost(hostSlug, channelSlug) || withHostCard.length === 0) {
		return withHostCard;
	}

	const hook = firstClassChannelAudienceHook(hostSlug, platformLabel);
	const [first, ...rest] = withHostCard;
	return [
		{
			...first,
			description: `${first.description.trim().replace(/\.$/, '')}. ${hook}`
		},
		...rest
	];
}

/** Up to one channel-tailored ecosystem FAQ (host landing FAQs are merged separately on the base VM). */
export function buildAgentChannelEcosystemFaqItems(params: {
	hostSlug: string;
	channelSlug: string;
	platformLabel: string;
	agentLabel: string;
}): PublicFaqItem[] {
	const { hostSlug, channelSlug, platformLabel, agentLabel } = params;
	const slug = normalizeHostSlug(hostSlug);
	const ecosystemId = getAgentHostEcosystemId(slug);
	if (!ecosystemId) return [];

	if (isFirstClassChannelForHost(slug, channelSlug)) {
		const agentLinks = buildAgentFaqLinks(slug, `/docs/agent-setup-guides/${slug}`);
		const channelLanding = faqLink(
			agentLinks.agentChannel(channelSlug),
			`${platformLabel} channel landing`
		);
		return [
			{
				title: `Is ${platformLabel} first-class for ${agentLabel}?`,
				description: `Yes. ${platformLabel} is a first-class ${agentLabel} channel on OpenQuok. Open the ${channelLanding} for setup steps, CLI examples, and channel FAQs.`
			}
		];
	}

	return [];
}

/** Non-messaging-gateway hosts: platform-focused hero lead (messaging hosts keep the Telegram/WhatsApp template). */
export function buildAgentChannelEcosystemHeroDescription(params: {
	hostSlug: string;
	agentLabel: string;
	platformLabel: string;
}): string {
	const slug = normalizeHostSlug(params.hostSlug);
	const { agentLabel, platformLabel } = params;
	const ecosystemId = getAgentHostEcosystemId(slug);

	if (ecosystemId === 'meta-consumer') {
		return `Message ${agentLabel} from muse.ai or WhatsApp. Connect OpenQuok for ${platformLabel} with a custom connector or openquok-core in Muse Secure VM. You review and approve on the calendar or kanban.`;
	}

	if (ecosystemId === 'openai-personal-agents' && slug === 'dots') {
		return `Message your dot from ChatGPT, Slack, or Microsoft Teams. Add openquok-core so it drafts and schedules ${platformLabel} posts while you review on the calendar or kanban.`;
	}

	if (ecosystemId === 'xai-grok') {
		return `Message ${agentLabel} from the macOS, Windows, or iOS app. Add openquok-core on its cloud computer so it drafts and schedules ${platformLabel} posts while you review and approve on the calendar or kanban.`;
	}

	return `Use ${agentLabel} with openquok-core to draft and schedule ${platformLabel} posts. You review and approve on the calendar or kanban.`;
}

/** Stable-sort hub channel links: ecosystem first-class slugs first, then catalog order. */
export function sortAgentChannelHubLinks(
	links: readonly PublicAgentChannelHubLinkViewModel[],
	hostSlug: string
): PublicAgentChannelHubLinkViewModel[] {
	const id = getLandingEcosystemId(hostSlug);
	const ecosystem = id ? ECOSYSTEM_PROFILES[id] : undefined;
	if (!ecosystem || ecosystem.firstClassChannelSlugs.length === 0) {
		return [...links];
	}

	const priority = new Map(
		ecosystem.firstClassChannelSlugs.map((slug, index) => [slug, index])
	);

	return [...links].sort((a, b) => {
		const aRank = priority.get(a.slug) ?? Number.POSITIVE_INFINITY;
		const bRank = priority.get(b.slug) ?? Number.POSITIVE_INFINITY;
		if (aRank !== bRank) return aRank - bRank;
		return 0;
	});
}

function pinBySlugOrder<T extends { slug: string }>(
	items: readonly T[],
	pinnedSlugs: readonly string[]
): T[] {
	if (pinnedSlugs.length === 0) return [...items];

	const rank = new Map(pinnedSlugs.map((slug, index) => [slug.trim().toLowerCase(), index]));

	return [...items].sort((a, b) => {
		const aRank = rank.get(a.slug.trim().toLowerCase()) ?? Number.POSITIVE_INFINITY;
		const bRank = rank.get(b.slug.trim().toLowerCase()) ?? Number.POSITIVE_INFINITY;
		if (aRank !== bRank) return aRank - bRank;
		return 0;
	});
}

export function sortAgentIntegrationsForEcosystem<T extends { slug: string }>(
	items: readonly T[],
	hostSlug: string,
	kind: 'agent-host' | 'mcp-client'
): T[] {
	const ecosystem = getAgentHostEcosystem(hostSlug);
	if (!ecosystem) return [...items];

	const pinned =
		kind === 'agent-host' ? ecosystem.relatedAgentSlugs : ecosystem.relatedMcpSlugs;
	return pinBySlugOrder(items, pinned);
}

export function buildAgentHostEcosystemChannelSiblingGridHubTitle(
	agentLabel: string,
	hostSlug: string
): string {
	const ecosystemId = getAgentHostEcosystemId(hostSlug);
	const agent = agentLabel.trim();

	if (ecosystemId === 'meta-consumer' && agent.length > 0) {
		return `${agent}: Meta channels first, then every supported network`;
	}

	if (ecosystemId === 'xai-grok' && agent.length > 0) {
		return `${agent}: X first, then every supported channel`;
	}

	return buildPublicAgentChannelSiblingGridHubTitle(agent);
}

/** Ecosystem for `/channels/{slug}` when the channel is first-class for a mapped agent host. */
export function getChannelPageEcosystemId(channelSlug: string): AgentHostEcosystemId | undefined {
	const channel = normalizeHostSlug(channelSlug);
	for (const profile of Object.values(ECOSYSTEM_PROFILES)) {
		if (profile.firstClassChannelSlugs.includes(channel)) {
			return profile.id;
		}
	}
	return undefined;
}

/** Primary agent host slug for channel-page ecosystem copy and MCP sort order. */
export function getPrimaryAgentHostSlugForChannelPage(channelSlug: string): string | undefined {
	const ecosystemId = getChannelPageEcosystemId(channelSlug);
	if (ecosystemId === 'meta-consumer') return 'meta-muse';
	if (ecosystemId === 'xai-grok') return 'grok-bot';
	return undefined;
}

/** Fourth WhoIsFor card on `/channels/{slug}` for vendor-aligned first-class channels. */
export function buildPublicChannelEcosystemAudienceTailoredCard(
	channelSlug: string,
	platformLabel: string
): AudienceCard | undefined {
	const ecosystemId = getChannelPageEcosystemId(channelSlug);
	const label = platformLabel.trim();
	if (!ecosystemId || label.length === 0) return undefined;

	if (ecosystemId === 'meta-consumer') {
		return {
			iconName: icons.MetaMuse.name,
			iconClass: 'text-sky-400',
			title: 'Meta Muse first-class',
			description: `${label} is a first-class Meta Muse channel. Message Meta Muse from muse.ai or WhatsApp, or use Muse Code MCP — then schedule every other network from the same OpenQuok workspace.`,
			containerClass: CARD_CONTAINER_CLASS
		};
	}

	if (ecosystemId === 'xai-grok') {
		return {
			iconName: icons.GrokBot.name,
			iconClass: 'text-rose-400',
			title: 'Grok Bot & xAI cloud desktop',
			description: `X is first-class for Grok Bot. Run openquok-core on xAI’s cloud computer with many named Bots, or draft posts from Cursor and other MCP clients before you approve on the calendar.`,
			containerClass: CARD_CONTAINER_CLASS
		};
	}

	return undefined;
}

/** Append first-class hook on card 0 for ecosystem channel landings (mirrors agent × channel pages). */
export function applyPublicChannelPageAudienceFirstCardHook(
	cards: readonly AudienceCard[],
	channelSlug: string,
	platformLabel: string
): AudienceCard[] {
	const hostSlug = getPrimaryAgentHostSlugForChannelPage(channelSlug);
	if (!hostSlug || !isFirstClassChannelForHost(hostSlug, channelSlug) || cards.length === 0) {
		return [...cards];
	}

	const hook = firstClassChannelAudienceHook(hostSlug, platformLabel);
	const [first, ...rest] = cards;
	return [
		{
			...first,
			description: `${first.description.trim().replace(/\.$/, '')}. ${hook}`
		},
		...rest
	];
}

/** Vendor-aligned FAQ rows prepended on `/channels/{slug}` (dedupe by title when merging). */
export function buildPublicChannelEcosystemFaqItems(params: {
	channelSlug: string;
	platformLabel: string;
}): PublicFaqItem[] {
	const { channelSlug, platformLabel } = params;
	const ecosystemId = getChannelPageEcosystemId(channelSlug);
	const hostSlug = getPrimaryAgentHostSlugForChannelPage(channelSlug);
	if (!ecosystemId || !hostSlug) return [];

	const agentLinks = buildAgentFaqLinks(hostSlug, `/docs/agent-setup-guides/${hostSlug}`);
	const channelLanding = faqLink(
		agentLinks.agentChannel(channelSlug),
		`${platformLabel} agent landing`
	);

	if (ecosystemId === 'xai-grok') {
		return [
			{
				title: `Which agent is first-class for ${platformLabel}?`,
				description: `${platformLabel} is first-class for Grok Bot on OpenQuok. Open the ${channelLanding} for xAI cloud-desktop setup, openquok-core skills, and ${platformLabel} CLI examples.`
			},
			{
				title: `How do Grok Bot, OpenClaw, and Cursor fit ${platformLabel} scheduling?`,
				description: `${buildAgentHostPickerFaqDescription('grok-bot')} Choose ${faqLink(publicFaqHref.cursorLanding, 'Cursor')} MCP when you want in-editor openquok-core tool calls without running a cloud desktop teammate.`
			}
		];
	}

	if (ecosystemId === 'meta-consumer') {
		return [
			{
				title: `Is ${platformLabel} first-class for Meta Muse?`,
				description: `Yes. ${platformLabel} is a first-class Meta Muse channel on OpenQuok. ${metaOwnedFirstClassChannelFaqDescription(
					'meta-muse',
					'/docs/agent-setup-guides/meta-muse',
					'Meta Muse'
				)}`
			}
		];
	}

	return [];
}

export function buildAgentHostEcosystemChannelSiblingGridHubDescription(
	agentLabel: string,
	hostSlug: string
): string {
	const ecosystemId = getAgentHostEcosystemId(hostSlug);
	const agent = agentLabel.trim();

	if (ecosystemId === 'meta-consumer' && agent.length > 0) {
		return `Start with Facebook, Instagram, and Threads for ${agent}. Then open every other supported channel for workflows, CLI examples, and FAQs.`;
	}

	if (ecosystemId === 'openai-personal-agents' && agent.length > 0) {
		return `Pick a channel for ${agent} and OpenAI-aligned agent workflows. Compare Dots and OpenClaw on the integrations grid when you evaluate hosts.`;
	}

	if (ecosystemId === 'xai-grok' && agent.length > 0) {
		return `Start with X for ${agent}, then add every other supported network from the same cloud-desktop teammate.`;
	}

	return buildPublicAgentChannelSiblingGridHubDescription(agent);
}
