import type { PublicFaqItem } from '$lib/content/constants/faq';
import { buildPublishApprovalFaqAnswer } from '$lib/content/constants/schedulingPublishChoice';
import { faqHrefAgent, faqHrefDocs, faqLink, publicFaqHref } from '$lib/content/utils/publicFaqLinks';

export type MessagingGatewayAgentFaqParams = {
	slug: string;
	agentLabel: string;
	/** Label passed to `buildPublishApprovalFaqAnswer` (e.g. `OpenClaw`, `Hermes`). */
	publishApprovalLabel: string;
	whatIsTitle: string;
	whatIsDescription: string;
	installSkillTitle: string;
	installSkillDescription: string;
	/** Suffix on the platforms FAQ (integration UUID sentence). */
	platformsAccountSuffix: string;
	otherAgentsDescription: string;
	mcpComparisonDescription: string;
	hostRuntimeTitle: string;
	hostRuntimeDescription: string;
	trialInstallPhrase: string;
};

export function buildMessagingGatewayAgentFaqItems(
	params: MessagingGatewayAgentFaqParams
): PublicFaqItem[] {
	const { agentLabel, publishApprovalLabel } = params;

	return [
		{
			title: params.whatIsTitle,
			description: params.whatIsDescription
		},
		{
			title: params.installSkillTitle,
			description: params.installSkillDescription
		},
		{
			title: `What can ${agentLabel} do with OpenQuok?`,
			description: `Draft and schedule posts, upload media, configure plugs, and pull analytics across your connected channels. See ${faqLink(publicFaqHref.channels, 'supported channels')} and ${faqLink(publicFaqHref.cliManagingPosts, 'CLI post commands')}; openquok-core returns structured JSON for the agent.`
		},
		{
			title: 'Which social media platforms are supported?',
			description: `Facebook, Instagram, Threads, YouTube, TikTok, LinkedIn, and X are supported today. Connect channels in the OpenQuok web app or follow the ${faqLink(publicFaqHref.socialIntegration, 'channel setup guides')}; see every network on ${faqLink(publicFaqHref.channels, 'Supported channels')}. ${params.platformsAccountSuffix}`
		},
		{
			title: `Does ${publishApprovalLabel} publish immediately or wait for approval?`,
			description: buildPublishApprovalFaqAnswer(publishApprovalLabel)
		},
		{
			title: 'Does it work with other AI agents?',
			description: params.otherAgentsDescription
		},
		{
			title: `Why use ${agentLabel} instead of an MCP client?`,
			description: params.mcpComparisonDescription
		},
		{
			title: params.hostRuntimeTitle,
			description: params.hostRuntimeDescription
		},
		{
			title: 'Is it free to start?',
			description: `Yes. Create an OpenQuok account and start a 7-day free trial on ${faqLink(publicFaqHref.pricing, 'Pricing')}, connect your channels, ${params.trialInstallPhrase}, and begin scheduling from chat.`
		}
	];
}

export function buildMessagingGatewayOpenClawFaqParams(): MessagingGatewayAgentFaqParams {
	return {
		slug: 'openclaw',
		agentLabel: 'OpenClaw',
		publishApprovalLabel: 'OpenClaw',
		whatIsTitle: 'What is OpenClaw?',
		whatIsDescription: `OpenClaw is an open-source personal AI assistant you self-host. A local Gateway routes chat from WhatsApp, Telegram, Slack, Discord, and many other channels to your agent, with browser tools, cron, sessions, and workspace skills. Add openquok-core to draft and schedule through OpenQuok. Docs: https://docs.openclaw.ai. See the ${faqLink(faqHrefAgent('openclaw'), 'OpenClaw integration')} and ${faqLink(publicFaqHref.agentSetupGuides, 'agent setup guides')}.`,
		installSkillTitle: 'How do I install the openquok-core skill in OpenClaw?',
		installSkillDescription: `Add openquok-core to your OpenClaw workspace, install @openquok/auto-cli, and authenticate once. See the ${faqLink(faqHrefDocs('agent-setup-guides/openclaw'), 'OpenClaw agent guide')} and ${faqLink(publicFaqHref.cliGettingStarted, 'CLI getting started')}.`,
		platformsAccountSuffix:
			'OpenClaw uses integration UUIDs from openquok integrations:list to target the right accounts.',
		otherAgentsDescription: `Yes. OpenQuok is CLI-first — any agent that can run shell commands can use openquok, including ${faqLink(publicFaqHref.cursorLanding, 'Cursor')}, Claude Code, ChatGPT, and custom automation. This page focuses on ${faqLink(faqHrefAgent('openclaw'), 'OpenClaw')} plus the openquok-core skill; pair it with other OpenClaw skills (Bloom, RevenueCat, or your own) for richer workflows. Browse ${faqLink(publicFaqHref.agents, 'agent hosts and MCP clients')}.`,
		mcpComparisonDescription: `${faqLink(publicFaqHref.cursorLanding, 'Cursor')} and other MCP clients fit editor sessions — see ${faqLink(publicFaqHref.mcpSetupGuides, 'MCP setup guides')}. OpenClaw fits always-on chat from Telegram, WhatsApp, or Slack. Pick OpenClaw for messaging and scale; pick MCP for in-repo workflows. Many teams use both.`,
		hostRuntimeTitle: 'Can I run OpenClaw on Railway or another host?',
		hostRuntimeDescription: `Yes. Run on your own hardware or in Docker with a persistent workspace, install openquok-core, and authenticate once. See the ${faqLink(publicFaqHref.dockerCompose, 'Docker Compose self-host guide')}.`,
		trialInstallPhrase: 'install openquok-core on OpenClaw'
	};
}

export function buildMessagingGatewayHermesFaqParams(): MessagingGatewayAgentFaqParams {
	return {
		slug: 'hermes',
		agentLabel: 'Hermes Agent',
		publishApprovalLabel: 'Hermes',
		whatIsTitle: 'What is Hermes Agent?',
		whatIsDescription: `Hermes Agent is Nous Research's autonomous assistant with a unified messaging gateway, browser and terminal tools, Skills Hub workflows, and optional MCP servers. It runs on laptop, VPS, Docker, or serverless backends and connects to 20+ chat platforms. Add openquok-core to draft and schedule through OpenQuok. See the ${faqLink(faqHrefAgent('hermes'), 'Hermes Agent integration')} and ${faqLink(publicFaqHref.agentSetupGuides, 'agent setup guides')}.`,
		installSkillTitle: 'How do I install the openquok-core skill in Hermes Agent?',
		installSkillDescription: `Install @openquok/auto-cli, add openquok-core under ~/.hermes/skills/, and authenticate once. See the ${faqLink(faqHrefDocs('agent-setup-guides/hermes'), 'Hermes agent guide')} and ${faqLink(publicFaqHref.cliGettingStarted, 'CLI getting started')}.`,
		platformsAccountSuffix:
			'Hermes uses integration UUIDs from openquok integrations:list to target the right accounts.',
		otherAgentsDescription: `Yes. OpenQuok is CLI-first — any agent that can run shell commands can use openquok, including ${faqLink(faqHrefAgent('openclaw'), 'OpenClaw')}, ${faqLink(publicFaqHref.cursorLanding, 'Cursor')}, and custom automation. This page focuses on ${faqLink(faqHrefAgent('hermes'), 'Hermes Agent')} plus the openquok-core skill; pair it with Skills Hub workflows, MCP servers, or cron for richer pipelines. Browse ${faqLink(publicFaqHref.agents, 'agent hosts and MCP clients')}.`,
		mcpComparisonDescription: `${faqLink(publicFaqHref.cursorLanding, 'Cursor')} and other MCP clients fit editor sessions — see ${faqLink(publicFaqHref.mcpSetupGuides, 'MCP setup guides')}. Hermes fits always-on chat from Telegram, Discord, Slack, or WhatsApp. Pick Hermes for messaging and scale; pick MCP for in-repo workflows. Many teams use both.`,
		hostRuntimeTitle: 'Can I run Hermes on a VPS or serverless host?',
		hostRuntimeDescription: `Yes. Run on a VPS, Docker, or serverless backend with a persistent ~/.hermes/ volume, install openquok-core, and authenticate once. See the ${faqLink(publicFaqHref.dockerCompose, 'Docker Compose self-host guide')}.`,
		trialInstallPhrase: 'install openquok-core on Hermes'
	};
}
