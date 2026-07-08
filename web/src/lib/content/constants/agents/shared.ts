import { icons } from '$data/icons';

import type {
	FeaturesAnimatedModel,
	PublicAgentListingsPreviewSection
} from '$lib/content/constants/agents/types';

export const DEFAULT_LLM_MODELS: FeaturesAnimatedModel[] = [
	{
		name: 'GPT-4o',
		provider: 'OpenAI',
		description:
			'Fast, capable default for agents that need strong reasoning, tool use, and reliable structured output.',
		iconName: icons.ChatGPT.name,
		containerClass: 'bg-neutral-900',
		iconClass: 'size-14 text-white'
	},
	{
		name: 'Claude Sonnet',
		provider: 'Anthropic',
		description:
			'Balanced speed and quality for long conversations, careful drafting, and nuanced instruction following.',
		iconName: icons.Claude.name,
		containerClass: 'bg-[#FCF2EE]',
		iconClass: 'size-14'
	},
	{
		name: 'Gemini Pro',
		provider: 'Google',
		description:
			'Multimodal models with strong performance on mixed text, vision, and high-volume agent workloads.',
		iconName: icons.Gemini.name,
		containerClass: 'bg-white',
		iconClass: 'size-14'
	},
	{
		name: 'Local models',
		provider: 'Ollama & self-hosted',
		description:
			'Run Llama, Mistral, or other open weights on your own hardware with full data control.',
		iconName: icons.Bot.name,
		containerClass: 'bg-primary/10',
		iconClass: 'size-12 text-primary'
	}
];

export const DEFAULT_AGENT_INTEGRATIONS: FeaturesAnimatedModel[] = [
	{
		name: 'Bloom',
		provider: 'The brand layer for agents',
		description:
			'Register Bloom as an OpenClaw MCP server to onboard your brand and generate on-brand images — then schedule approved posts with OpenQuok.',
		iconName: icons.Bloom.name,
		containerClass: 'bg-white',
		iconClass: 'size-14'
	},
	{
		name: 'RevenueCat',
		provider: 'Subscriptions MCP for agents',
		description:
			'Connect the RevenueCat MCP server in OpenClaw to read MRR, trials, and churn — then draft TikTok posts and schedule them on OpenQuok for your review.',
		iconName: icons.RevenueCat.name,
		containerClass: 'bg-white',
		iconClass: 'size-14'
	},
	{
		name: 'Your own skills',
		provider: 'OpenClaw ecosystem',
		description:
			'Install any skill next to openquok-core — analytics, creative pipelines, or custom workflows — and keep humans in the loop on publish.',
		iconName: icons.Sparkles.name,
		containerClass: 'bg-primary/10',
		iconClass: 'size-12 text-primary'
	}
];

/** Listing cards per preview grid block (playbooks or building blocks); see-all card is extra. */
export const DEFAULT_LISTINGS_PREVIEW_ITEMS_PER_BLOCK = 6;

/** Default listings preview copy shared by agent host landing pages. */
export const PUBLIC_AGENT_LISTINGS_PREVIEW_SECTION = {
	headingId: 'agent-listings-preview-heading',
	subtitle: 'Playbooks & Building Blocks Directories',
	title: 'Explore Viral Formats',
	description:
		'Mix playbooks, skills, and MCP servers—then tailor them to your use case.',
	playbooksGridLabel: 'Playbooks',
	buildingBlocksGridLabel: 'Building Blocks',
	playbooksSeeAllDescription: 'Browse every published playbook.',
	playbooksSkillBuilderDescription: 'Build and export a SKILL.md from building blocks.',
	buildingBlocksSeeAllDescription: 'Browse every published building block.',
	itemsPerBlockLimit: DEFAULT_LISTINGS_PREVIEW_ITEMS_PER_BLOCK
} satisfies PublicAgentListingsPreviewSection;

/** Main marketing landing page — same copy as agent previews, distinct section id. */
export const LANDING_PAGE_LISTINGS_PREVIEW_SECTION = {
	...PUBLIC_AGENT_LISTINGS_PREVIEW_SECTION,
	headingId: 'landing-listings-preview-heading'
} satisfies PublicAgentListingsPreviewSection;
