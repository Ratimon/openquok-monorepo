import type { AgentHostDecisionScenarioId } from '$lib/content/constants/agents/decision-scenarios';

/** Landing UI template — structure and default mocks, not SEO positioning. */
export type AgentHostUiArchetype =
	| 'messaging-gateway'
	| 'vendor-cloud-computer'
	| 'connector-personal-agent'
	| 'desktop-skill-ide';

export type AgentHostFeatureHighlight = {
	/** Stable id for tests and future section injection. */
	id: string;
	title: string;
	description: string;
};

export type AgentHostProfile = {
	slug: string;
	uiArchetype: AgentHostUiArchetype;
	/** Scenario ids this host is listed under in `AGENT_HOST_DECISION_SCENARIOS`. */
	scenarioIds: readonly AgentHostDecisionScenarioId[];
	traits: readonly string[];
	/** Append when a host ships a tailored capability (SEO / feature rows). */
	featureHighlights: readonly AgentHostFeatureHighlight[];
};

export const AGENT_HOST_PROFILES: readonly AgentHostProfile[] = [
	{
		slug: 'openclaw',
		uiArchetype: 'messaging-gateway',
		scenarioIds: ['self-hosted-data-control', 'messaging-gateway-ui', 'model-agnostic'],
		traits: ['self-host', 'messaging-gateway', 'multi-channel', 'skill-install'],
		featureHighlights: []
	},
	{
		slug: 'hermes',
		uiArchetype: 'messaging-gateway',
		scenarioIds: ['self-hosted-data-control', 'messaging-gateway-ui', 'model-agnostic'],
		traits: ['self-host', 'messaging-gateway', 'skills-hub', 'mcp'],
		featureHighlights: []
	},
	{
		slug: 'grok-bot',
		uiArchetype: 'vendor-cloud-computer',
		scenarioIds: ['many-named-agents-cloud-desktop', 'no-server-ops-cloud-browser'],
		traits: ['vendor-cloud-computer', 'multi-bot', 'desktop-ios'],
		featureHighlights: []
	},
	{
		slug: 'dots',
		uiArchetype: 'vendor-cloud-computer',
		scenarioIds: ['openai-workplace-chat', 'no-server-ops-cloud-browser'],
		traits: ['openai-cloud-computer', 'chatgpt-slack-teams', 'plugins'],
		featureHighlights: []
	},
	{
		slug: 'manus',
		uiArchetype: 'vendor-cloud-computer',
		scenarioIds: ['no-server-ops-cloud-browser'],
		traits: ['skills', 'cloud-computer', 'studio'],
		featureHighlights: []
	},
	{
		slug: 'meta-muse',
		uiArchetype: 'connector-personal-agent',
		scenarioIds: [],
		traits: ['custom-connector', 'secure-vm', 'mobile-first'],
		featureHighlights: []
	},
	{
		slug: 'thinkrail',
		uiArchetype: 'desktop-skill-ide',
		scenarioIds: ['model-agnostic'],
		traits: ['desktop-ide', 'worktree', 'skill-path'],
		featureHighlights: []
	}
];

const profilesBySlug = new Map(AGENT_HOST_PROFILES.map((profile) => [profile.slug, profile]));

export function getAgentHostProfile(slug: string): AgentHostProfile | undefined {
	return profilesBySlug.get(slug.trim().toLowerCase());
}

export function requireAgentHostProfile(slug: string): AgentHostProfile {
	const profile = getAgentHostProfile(slug);
	if (!profile) {
		throw new Error(`Missing agent host profile for slug: ${slug}`);
	}
	return profile;
}
