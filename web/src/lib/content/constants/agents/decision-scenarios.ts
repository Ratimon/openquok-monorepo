import { faqHrefAgent, faqLink, publicFaqHref } from '$lib/content/utils/publicFaqLinks';

/** Buyer scenarios aligned with agent host picker blog guidance. */
export type AgentHostDecisionScenarioId =
	| 'many-named-agents-cloud-desktop'
	| 'openai-workplace-chat'
	| 'self-hosted-data-control'
	| 'messaging-gateway-ui'
	| 'no-server-ops-cloud-browser'
	| 'model-agnostic'
	| 'editor-mcp-sessions';

export type AgentHostDecisionScenario = {
	id: AgentHostDecisionScenarioId;
	/** Short STE100 label for docs and FAQ cross-links. */
	title: string;
	/** Host slugs that fit this scenario (catalog `slug` / `agentId`). */
	hostSlugs: readonly string[];
};

export const AGENT_HOST_DECISION_SCENARIOS: readonly AgentHostDecisionScenario[] = [
	{
		id: 'many-named-agents-cloud-desktop',
		title: 'Many named agents on one cloud desktop',
		hostSlugs: ['grok-bot']
	},
	{
		id: 'openai-workplace-chat',
		title: 'ChatGPT, Slack, or Teams with an OpenAI cloud computer',
		hostSlugs: ['dots']
	},
	{
		id: 'self-hosted-data-control',
		title: 'Credentials on infrastructure you control',
		hostSlugs: ['openclaw', 'hermes']
	},
	{
		id: 'messaging-gateway-ui',
		title: 'Telegram, WhatsApp, or Slack as the daily UI',
		hostSlugs: ['openclaw', 'hermes']
	},
	{
		id: 'no-server-ops-cloud-browser',
		title: 'Persistent cloud browser without running a server',
		hostSlugs: ['grok-bot', 'dots', 'manus']
	},
	{
		id: 'model-agnostic',
		title: 'Any LLM vendor or self-hosted model',
		hostSlugs: ['openclaw', 'hermes', 'thinkrail']
	},
	{
		id: 'editor-mcp-sessions',
		title: 'In-repo MCP tool calls in your editor',
		hostSlugs: []
	}
];

const scenariosById = new Map(AGENT_HOST_DECISION_SCENARIOS.map((scenario) => [scenario.id, scenario]));

export function getAgentHostDecisionScenario(
	id: AgentHostDecisionScenarioId
): AgentHostDecisionScenario | undefined {
	return scenariosById.get(id);
}

export function listAgentHostSlugsForScenario(id: AgentHostDecisionScenarioId): readonly string[] {
	return scenariosById.get(id)?.hostSlugs ?? [];
}

/**
 * FAQ-style cross-host picker (Grok Bot vs OpenClaw vs Dots) with link to the scenario blog post.
 */
export function buildAgentHostPickerFaqDescription(forHostSlug: string): string {
	const slug = forHostSlug.trim().toLowerCase();
	const blog = faqLink(
		publicFaqHref.blogGrokBotVsOpenclaw,
		'Grok Bot vs OpenClaw guide'
	);

	if (slug === 'dots') {
		return `Choose ${faqLink(publicFaqHref.grokBotLanding, 'Grok Bot')} for many xAI teammates on one shared cloud desktop. Choose ${faqLink(publicFaqHref.openclawLanding, 'OpenClaw')} for self-hosted Telegram, WhatsApp, or Slack on your hardware. Choose Dots when you live in ChatGPT, Slack, or Teams and want OpenAI-managed cloud computers. See the ${blog} for scenario guidance.`;
	}

	if (slug === 'grok-bot') {
		return `Choose Grok Bot for many named Bots on one xAI cloud desktop without server ops. Choose ${faqLink(publicFaqHref.grokBuildLanding, 'Grok Build')} MCP when you want the xAI coding agent in your terminal. Choose ${faqLink(publicFaqHref.openclawLanding, 'OpenClaw')} when you must self-host and message from Telegram, WhatsApp, or Slack. Choose ${faqLink(publicFaqHref.dotsLanding, 'Dots')} for OpenAI workplace chat. See the ${blog}.`;
	}

	if (slug === 'openclaw' || slug === 'hermes') {
		const self = faqLink(faqHrefAgent(slug), slug === 'openclaw' ? 'OpenClaw' : 'Hermes Agent');
		return `${self} fits self-hosted gateways and messaging-first scheduling. Choose ${faqLink(publicFaqHref.grokBotLanding, 'Grok Bot')} or ${faqLink(publicFaqHref.dotsLanding, 'Dots')} when you want a vendor cloud computer instead. See the ${blog}.`;
	}

	return `Compare ${faqLink(publicFaqHref.grokBotLanding, 'Grok Bot')}, ${faqLink(publicFaqHref.openclawLanding, 'OpenClaw')}, and ${faqLink(publicFaqHref.dotsLanding, 'Dots')} by scenario on the ${blog}. Browse ${faqLink(publicFaqHref.agents, 'agent hosts and MCP clients')}.`;
}
