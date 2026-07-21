import type { PublicAgentChannelPageConfig } from '$lib/content/constants/publicAgentChannelConfig';
import type { PublicAgentHostLandingPageViewModel } from '$lib/content/constants/publicAgentConfig';
import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/publicChannelConfig';

import { customizeAgentsChannelFeatureSections } from '$lib/content/utils/buildAgentsChannelFeatureSections';
import { buildAgentsChannelAudienceSection } from '$lib/content/utils/buildAgentsChannelAudienceSection';
import { buildAgentChannelMetaTitle } from '$lib/content/utils/buildProgrammaticSeoTitles';

/** Merge a base agent host VM with channel-specific SEO copy and showcases. */
export function buildAgentChannelLandingVm(params: {
	baseAgent: PublicAgentHostLandingPageViewModel;
	channel: PublicChannelLandingPageViewModel;
	channelConfig: PublicAgentChannelPageConfig;
}): PublicAgentHostLandingPageViewModel {
	const { baseAgent, channel, channelConfig } = params;
	const platformLabel = channel.platformLabel;
	const agentLabel = baseAgent.agentLabel;
	const audienceSection = buildAgentsChannelAudienceSection({
		channel,
		agentLabel,
		mode: 'agent-host'
	});

	return {
		...baseAgent,
		heroSecondaryIcon: channel.icon,
		...audienceSection,
		metaTitle: buildAgentChannelMetaTitle(platformLabel, agentLabel),
		metaDescription: channelConfig.metaDescription.replace('OpenClaw', agentLabel),
		keywords: [
			...channelConfig.keywords.map((keyword) =>
				keyword.replace('OpenClaw', agentLabel)
			)
		],
		heroTitle: `Schedule ${platformLabel} from ${agentLabel} then you approve`,
		heroDescription: `Message ${agentLabel} from Telegram, WhatsApp, or Slack. Add the openquok-core skill so it schedules ${platformLabel} posts while you review on the calendar or kanban.`,
		workflowSection: baseAgent.workflowSection
			? {
					...baseAgent.workflowSection,
					description: baseAgent.workflowSection.description.replace(
						'social posts',
						`${platformLabel} posts`
					),
					imageAlt: `${agentLabel} chat scheduling ${platformLabel} posts via OpenQuok`
				}
			: undefined,
		featureSections: customizeAgentsChannelFeatureSections(
			baseAgent.featureSections,
			channel,
			channelConfig,
			'agent-host'
		),
		listingsPreviewSection: {
			...baseAgent.listingsPreviewSection,
			title: `${platformLabel} viral formats`,
			description: `Mix ${platformLabel}-focused skills, and MCP servers — then tailor them to your ${agentLabel} workflow.`,
			playbooksSeeAllDescription: `Browse every ${platformLabel} playbook.`,
			playbooksSkillBuilderDescription: `Build and export a ${platformLabel} SKILL.md from building blocks.`,
			buildingBlocksSeeAllDescription: `Browse every ${platformLabel} building block.`
		},
		comparisonSection: baseAgent.comparisonSection
			? {
					...baseAgent.comparisonSection,
					description: baseAgent.comparisonSection.description.replace(
						'agents',
						`${platformLabel} from ${agentLabel}`
					)
				}
			: undefined,
		commandReferenceSection: baseAgent.commandReferenceSection
			? {
					...baseAgent.commandReferenceSection,
					description: `${platformLabel} commands from the openquok-core skill — structured JSON on stdout, human-in-the-loop drafts, and workspace media uploads.`,
					commands: channelConfig.commands
				}
			: undefined,
		faqSubtitle: baseAgent.faqSubtitle,
		faqTitle: `${agentLabel} + ${platformLabel}, answered`,
		faqDescription: `What ${agentLabel} is, how to install openquok-core, scheduling ${platformLabel} posts, human approval, and how agents draft from chat.`,
		faqItems: baseAgent.faqItems.map((item) => {
			if (item.title === 'Which social media platforms are supported?') {
				return {
					...item,
					title: `How does ${agentLabel} schedule ${platformLabel} posts?`,
					description: `Connect your ${platformLabel} account in the OpenQuok web app, install openquok-core on ${agentLabel}, and message your assistant to schedule. ${agentLabel} uses integration UUIDs from openquok integrations:list to target your ${platformLabel} account. Every post lands as a draft or scheduled item until you approve on the calendar or kanban.`
				};
			}
			if (
				item.title === 'What can OpenClaw do with OpenQuok?' ||
				item.title === 'What can Hermes Agent do with OpenQuok?'
			) {
				return {
					...item,
					title: `What can ${agentLabel} do with ${platformLabel} on OpenQuok?`,
					description: `${agentLabel} can draft and schedule ${platformLabel} posts, upload images and video, apply per-platform settings, and pull platform and post analytics for your connected ${platformLabel} account. The openquok-core skill documents integrations:list, posts:create, posts:status, analytics:platform, upload, and more — every command returns structured JSON for the agent to parse.`
				};
			}
			return item;
		})
	};
}
