import type { PublicAgentChannelPageConfig } from '$lib/content/constants/agents/channels';
import { DEFAULT_DIRECTORY_AGENT_INTEGRATIONS } from '$lib/content/constants/agents/general';
import type {
	FeaturesOrderedStep,
	PublicAgentParallelMockItem,
	PublicLandingWorkflowSection
} from '$lib/content/constants/agents/types';
import type { McpClient } from '$lib/developers/utils/getMcpClientConfig';
import type { PublicFaqItem } from '$lib/content/constants/faq';
import { getMcpWorkflowDirectoryLaunchContentId } from '$lib/ui/templates/device-mocks/safari/mcpWorkflowDirectoryLaunchMockConfig';
import { faqHrefDocs, faqLink } from '$lib/content/utils/publicFaqLinks';

/** Agent hosts without an MCP client use this client theme for directory workflow mocks. */
export const DIRECTORY_WORKFLOW_MOCK_FALLBACK_CLIENT: McpClient = 'Cursor';

/** Step 5 carousel + copy for directory channel landings (social + directory launch). */
export function mapSetupStepsForDirectoryIntegrations(
	steps: readonly FeaturesOrderedStep[],
	options: { platformLabel: string; workflowLabel: string }
): FeaturesOrderedStep[] {
	const { platformLabel, workflowLabel } = options;
	return steps.map((step) => {
		if (step.animatedContent !== 'agent-integrations') {
			return step;
		}
		return {
			...step,
			content: `Add Bloom, RevenueCat, openquok-directory-launch, or other skills and MCPs beside OpenQuok in ${workflowLabel}. Prepare ${platformLabel} listings and social posts — you approve before publish or directory submit.`,
			animatedModels: [...DEFAULT_DIRECTORY_AGENT_INTEGRATIONS],
			mediaAlt: 'Skills and MCP integrations for OpenQuok social scheduling and directory launch'
		};
	});
}

export function buildDirectoryWorkflowSectionDeviceMock(
	mcpClient: McpClient
): Pick<PublicLandingWorkflowSection, 'deviceMock' | 'deviceMockContent'> {
	return {
		deviceMock: 'desktop',
		deviceMockContent: getMcpWorkflowDirectoryLaunchContentId(mcpClient)
	};
}

export function buildDirectoryMcpChannelMetaTitle(
	platformLabel: string,
	clientLabel: string
): string {
	return `${platformLabel} directory launch with ${clientLabel}`;
}

export function buildDirectoryAgentChannelHeroTitle(
	platformLabel: string,
	agentOrClientLabel: string
): string {
	return `Prepare ${platformLabel} launch from ${agentOrClientLabel} then you submit`;
}

export function buildDirectoryMcpChannelMetaDescription(
	clientLabel: string,
	platformLabel: string
): string {
	return `Connect ${clientLabel} to OpenQuok MCP to prepare ${platformLabel} listings. List product profiles, ensure variants, check listing readiness, and track domain rating — you submit on the directory site.`;
}

export function buildDirectoryMcpChannelHeroDescription(
	clientLabel: string,
	platformLabel: string,
	channelSlug: string
): string {
	return `Connect ${clientLabel} to OpenQuok over MCP with a programmatic token. Ask your agent to list directory destinations and product profiles, ensure the ${channelSlug} variant, and check listing readiness before you open the browser extension to submit on ${platformLabel}.`;
}

export function buildDirectoryAgentChannelHeroDescription(params: {
	agentLabel: string;
	platformLabel: string;
	channelSlug: string;
	messagingGateway: boolean;
}): string {
	const { agentLabel, platformLabel, channelSlug, messagingGateway } = params;
	if (messagingGateway) {
		return `Message ${agentLabel} from Telegram, WhatsApp, or Slack. Use openquok-core or MCP so it lists product profiles, ensures the ${channelSlug} variant, and checks ${platformLabel} listing readiness — you submit on the directory site.`;
	}
	return `Use ${agentLabel} with OpenQuok to prepare ${platformLabel} directory launches. List product profiles, ensure variants, check listing readiness, and track domain rating — you submit on the directory site.`;
}

export function buildDirectoryWorkflowSectionTitle(platformLabel: string): string {
	return `One prompt, ${platformLabel} launch prep`;
}

export function buildDirectoryWorkflowSectionDescription(
	assistantLabel: string,
	platformLabel: string,
	channelSlug: string
): string {
	return `Ask ${assistantLabel} to list directory destinations and product profiles, ensure the ${channelSlug} variant, and run a listing summary for ${platformLabel}. You review fields in the browser extension and submit on the directory site — no calendar or kanban.`;
}

export function buildDirectoryWorkflowSectionImageAlt(
	assistantLabel: string,
	platformLabel: string
): string {
	return `Prepare ${platformLabel} directory launch from ${assistantLabel} via OpenQuok`;
}

/** MCP client feature row subtitle on agent/MCP × directory channel landings. */
export const DIRECTORY_AGENT_MINIMAL_SETUP_SUBTITLE = 'Minimal setup';

/** Agent-host feature row subtitle on agent × directory channel landings. */
export const DIRECTORY_AGENT_CONNECT_ONCE_SUBTITLE = 'Connect Once';

export function buildDirectoryAgentChannelMinimalSetupFeatureCopy(params: {
	assistantLabel: string;
	platformLabel: string;
	channelSlug: string;
}): { title: string; description: string; cliCommands: string } {
	const { assistantLabel, platformLabel, channelSlug } = params;
	return {
		title:
			'stay in your editor or terminal, connect once, prep directory launches without switching apps',
		description: `${assistantLabel} runs where you already work. Add OpenQuok MCP once. List product profiles, ensure the ${channelSlug} variant, and check ${platformLabel} listing readiness. You submit on the directory site.`,
		cliCommands: `List my directory destinations and product profiles, ensure the ${channelSlug} variant, and show ${platformLabel} listing readiness`
	};
}

export function buildDirectoryAgentChannelConnectOnceFeatureCopy(params: {
	assistantLabel: string;
	platformLabel: string;
	channelSlug: string;
}): { title: string; description: string } {
	const { assistantLabel, platformLabel, channelSlug } = params;
	return {
		title: 'connect once, then prep directory launches from chat',
		description: `Link OpenQuok to ${assistantLabel} with openquok-core or MCP. List profiles, ensure the ${channelSlug} variant, and check ${platformLabel} readiness. You submit on the directory site.`
	};
}

/** Token panel + directory-launch MCP session (not social channel verify). */
export function buildDirectoryAgentChannelMinimalSetupParallelMocks(
	mcpClient: McpClient,
	assistantLabel: string
): PublicAgentParallelMockItem[] {
	const directoryLaunchContentId = getMcpWorkflowDirectoryLaunchContentId(mcpClient);
	return [
		{
			deviceMock: 'settings-panel',
			deviceMockContent: 'programmatic-access-token',
			imageAlt: 'Generate a programmatic OpenQuok access token'
		},
		{
			deviceMock: 'desktop',
			deviceMockContent: directoryLaunchContentId,
			imageAlt: `Prepare directory launch from ${assistantLabel} via OpenQuok MCP`
		}
	];
}

export function buildDirectoryOpportunitiesPreviewCopy(
	platformLabel: string,
	assistantLabel: string
): {
	title: string;
	description: string;
	backlinksSeeAllDescription: string;
	playbooksSeeAllDescription: string;
	playbooksSkillBuilderDescription: string;
	buildingBlocksSeeAllDescription: string;
} {
	return {
		title: `${platformLabel} launch playbooks`,
		description: `Mix ${platformLabel}-tagged playbooks, building blocks, and MCP servers — then tailor directory launch steps to your ${assistantLabel} workflow.`,
		backlinksSeeAllDescription: `Browse site guides that mention ${platformLabel} in the backlink directory.`,
		playbooksSeeAllDescription: `Browse every ${platformLabel} playbook.`,
		playbooksSkillBuilderDescription: `Build and export a ${platformLabel} SKILL.md from building blocks.`,
		buildingBlocksSeeAllDescription: `Browse every ${platformLabel} building block.`
	};
}

export function buildDirectoryChannelLandingFaqSubtitle(
	assistantLabel: string,
	platformLabel: string
): string {
	return `What ${assistantLabel} MCP is, how to connect OpenQuok, ${platformLabel} directory launch, listing readiness, and setup questions.`;
}

export function buildDirectoryAgentChannelLandingFaqSubtitle(
	agentLabel: string,
	platformLabel: string
): string {
	return `What ${agentLabel} is, how to install openquok-core, ${platformLabel} directory launch, listing readiness, and setup questions.`;
}

export function buildDirectoryMcpLaunchFaqAnswer(params: {
	clientLabel: string;
	platformLabel: string;
	docsHref: string;
	mcpClientGuideHref: string;
	cliExamplesPath: string;
}): string {
	const { clientLabel, platformLabel, docsHref, mcpClientGuideHref, cliExamplesPath } = params;
	const cliExamplesHref = faqHrefDocs(cliExamplesPath.replace(/^\/docs\//, ''));
	return `Read the ${faqLink(docsHref, `${platformLabel} directory integration`)}. Add OpenQuok MCP to ${clientLabel} — see the ${faqLink(mcpClientGuideHref, `${clientLabel} MCP setup guide`)}. Ask your assistant to call directoryProfilesList, directoryVariantsEnsure, and directoryListingSummary; you submit on the directory site. See ${faqLink(cliExamplesHref, `${platformLabel} CLI examples`)} for terminal recipes.`;
}

export function buildDirectoryMcpCapabilitiesFaqAnswer(params: {
	clientLabel: string;
	platformLabel: string;
	mcpClientGuideHref: string;
	cliExamplesPath: string;
}): string {
	const { clientLabel, platformLabel, mcpClientGuideHref, cliExamplesPath } = params;
	const cliExamplesHref = faqHrefDocs(cliExamplesPath.replace(/^\/docs\//, ''));
	return `${clientLabel} lists directory destinations and product profiles, ensures per-site variants, and returns listing readiness over MCP — including checkedAt on directory SEO overview. See ${faqLink(mcpClientGuideHref, `${clientLabel} MCP setup`)} and ${faqLink(cliExamplesHref, `${platformLabel} CLI examples`)}.`;
}

export function buildDirectoryAgentLaunchFaqAnswer(params: {
	agentLabel: string;
	platformLabel: string;
	channelLandingHref: string;
	docsHref: string;
	agentDocsHref: string;
	cliExamplesPath: string;
}): string {
	const {
		agentLabel,
		platformLabel,
		channelLandingHref,
		docsHref,
		agentDocsHref,
		cliExamplesPath
	} = params;
	const cliExamplesHref = faqHrefDocs(cliExamplesPath.replace(/^\/docs\//, ''));
	return `Create a product profile in your workspace and read the ${faqLink(docsHref, `${platformLabel} directory integration`)} or ${faqLink(channelLandingHref, `${platformLabel} channel landing`)}. Install openquok-core and openquok-directory-launch on ${agentLabel} with the ${faqLink(agentDocsHref, `${agentLabel} agent guide`)} (see ${faqLink(faqHrefDocs('other-skills/openquok-directory-launch'), 'directory-launch skill')}). Use openquok directory:* commands or MCP directory tools to list profiles, ensure variants, and check listing readiness before you submit on the directory site. See ${faqLink(cliExamplesHref, `${platformLabel} CLI examples`)}.`;
}

export function buildDirectoryAgentCapabilitiesFaqAnswer(params: {
	agentLabel: string;
	platformLabel: string;
	agentChannelHref: string;
	cliExamplesPath: string;
}): string {
	const { agentLabel, platformLabel, agentChannelHref, cliExamplesPath } = params;
	const cliExamplesHref = faqHrefDocs(cliExamplesPath.replace(/^\/docs\//, ''));
	return `${agentLabel} can list directory destinations and product profiles, ensure ${platformLabel} variants, return listing summaries, and refresh directory SEO overview (read checkedAt before you re-fetch DR). Install openquok-core for auth and shell safety, then openquok-directory-launch for directory:* CLI recipes (or use hosted MCP directory* tools with an opo_ token). Every command returns structured JSON for the agent to parse. See ${faqLink(agentChannelHref, `${agentLabel} + ${platformLabel}`)} and ${faqLink(cliExamplesHref, `${platformLabel} CLI examples`)}.`;
}

/** Replace social scheduling FAQ rows when composing agent/MCP × directory channel landings. */
export function mapDirectoryChannelLandingFaqItems(
	items: PublicFaqItem[],
	params: {
		assistantLabel: string;
		platformLabel: string;
		channelConfig: PublicAgentChannelPageConfig;
		mode: 'mcp-client' | 'agent-host';
		docsHref: string;
		mcpClientGuideHref?: string;
		channelLandingHref?: string;
		agentDocsHref?: string;
		agentChannelHref?: string;
	}
): PublicFaqItem[] {
	const {
		assistantLabel,
		platformLabel,
		channelConfig,
		mode,
		docsHref,
		mcpClientGuideHref,
		channelLandingHref,
		agentDocsHref,
		agentChannelHref
	} = params;

	return items.map((item) => {
		if (item.title === 'Which social platforms are supported?') {
			if (mode === 'mcp-client' && mcpClientGuideHref) {
				return {
					...item,
					title: `How does ${assistantLabel} prepare ${platformLabel} directory launches?`,
					description: buildDirectoryMcpLaunchFaqAnswer({
						clientLabel: assistantLabel,
						platformLabel,
						docsHref,
						mcpClientGuideHref,
						cliExamplesPath: channelConfig.cliExamplesPath
					})
				};
			}
			if (
				mode === 'agent-host' &&
				channelLandingHref &&
				agentDocsHref
			) {
				return {
					...item,
					title: `How does ${assistantLabel} prepare ${platformLabel} directory launches?`,
					description: buildDirectoryAgentLaunchFaqAnswer({
						agentLabel: assistantLabel,
						platformLabel,
						channelLandingHref,
						docsHref,
						agentDocsHref,
						cliExamplesPath: channelConfig.cliExamplesPath
					})
				};
			}
		}

		if (mode === 'mcp-client' && mcpClientGuideHref) {
			if (
				item.title === `What is OpenQuok MCP for ${assistantLabel}?` ||
				item.title.startsWith('What is OpenQuok MCP')
			) {
				return {
					...item,
					title: `What is OpenQuok MCP for ${platformLabel} on ${assistantLabel}?`,
					description: buildDirectoryMcpCapabilitiesFaqAnswer({
						clientLabel: assistantLabel,
						platformLabel,
						mcpClientGuideHref,
						cliExamplesPath: channelConfig.cliExamplesPath
					})
				};
			}
		}

		if (mode === 'agent-host' && agentChannelHref) {
			if (
				item.title === 'What can OpenClaw do with OpenQuok?' ||
				item.title === 'What can Hermes Agent do with OpenQuok?' ||
				item.title === 'What can Grok Bot do with OpenQuok?' ||
				item.title === 'What can ThinkRail do with OpenQuok?'
			) {
				return {
					...item,
					title: `What can ${assistantLabel} do with ${platformLabel} on OpenQuok?`,
					description: buildDirectoryAgentCapabilitiesFaqAnswer({
						agentLabel: assistantLabel,
						platformLabel,
						agentChannelHref,
						cliExamplesPath: channelConfig.cliExamplesPath
					})
				};
			}
		}

		return item;
	});
}
