import type { PublicAgentChannelPageConfig } from '$lib/content/constants/publicAgentChannelConfig';
import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/publicChannelConfig';
import type { PublicMcpLandingPageViewModel } from '$lib/content/constants/publicMcpConfig';

import { customizeAgentsChannelFeatureSections } from '$lib/content/utils/buildAgentsChannelFeatureSections';
import { buildAgentsChannelAudienceSection } from '$lib/content/utils/buildAgentsChannelAudienceSection';

/** Merge a base MCP client VM with channel-specific SEO copy and showcases. */
export function buildMcpChannelLandingVm(params: {
	baseMcp: PublicMcpLandingPageViewModel;
	channel: PublicChannelLandingPageViewModel;
	channelConfig: PublicAgentChannelPageConfig;
}): PublicMcpLandingPageViewModel {
	const { baseMcp, channel, channelConfig } = params;
	const platformLabel = channel.platformLabel;
	const clientLabel = baseMcp.agentLabel;
	const audienceSection = buildAgentsChannelAudienceSection({
		channel,
		agentLabel: clientLabel,
		mode: 'mcp-client'
	});

	return {
		...baseMcp,
		heroSecondaryIcon: channel.icon,
		...audienceSection,
		metaTitle: `${platformLabel} scheduling with ${clientLabel} MCP`,
		metaDescription: `Connect ${clientLabel} to OpenQuok MCP to draft and schedule ${platformLabel} posts from your editor or terminal. Queue drafts and approve every publish on the calendar or kanban.`,
		keywords: [
			`${clientLabel} ${platformLabel} MCP`,
			`${clientLabel} MCP`,
			`${platformLabel} MCP scheduler`,
			'OpenQuok MCP',
			'MCP social media scheduler',
			...channel.keywords.slice(0, 4)
		],
		heroTitle: `Schedule ${platformLabel} from ${clientLabel} then you approve`,
		heroDescription: `Connect ${clientLabel} to OpenQuok over MCP with a programmatic token. Draft and schedule ${platformLabel} posts in natural language while you review and approve on the calendar or kanban.`,
		workflowSection: {
			...baseMcp.workflowSection,
			title: `One prompt, ${platformLabel} on your calendar`,
			description: baseMcp.workflowSection.description.replace(
				'what to publish',
				`what to publish on ${platformLabel}`
			),
			imageAlt: `Schedule ${platformLabel} posts from ${clientLabel} via OpenQuok MCP`
		},
		featureSections: customizeAgentsChannelFeatureSections(
			baseMcp.featureSections,
			channel,
			channelConfig,
			'mcp-client'
		),
		listingsPreviewSection: {
			...baseMcp.listingsPreviewSection,
			title: `${platformLabel} viral formats`,
			description: `Mix ${platformLabel}-focused playbooks, skills, and MCP servers—then tailor them to your ${clientLabel} workflow.`,
			playbooksSeeAllDescription: `Browse every ${platformLabel} playbook.`,
			playbooksSkillBuilderDescription: `Build and export a ${platformLabel} SKILL.md from building blocks.`,
			buildingBlocksSeeAllDescription: `Browse every ${platformLabel} building block.`
		},
		comparisonSection: baseMcp.comparisonSection
			? {
					...baseMcp.comparisonSection,
					description: baseMcp.comparisonSection.description.replace(
						'MCP clients in your editor and terminal',
						`${platformLabel} from ${clientLabel} in your editor and terminal`
					)
				}
			: undefined,
		faqSubtitle: baseMcp.faqSubtitle,
		faqTitle: `${clientLabel} + ${platformLabel}, answered`,
		faqDescription: `What ${clientLabel} MCP is, how to connect OpenQuok, scheduling ${platformLabel} posts, human approval, and example prompts.`,
		faqItems: baseMcp.faqItems.map((item) => {
			if (item.title === 'Which social platforms are supported?') {
				return {
					...item,
					title: `How does ${clientLabel} schedule ${platformLabel} posts?`,
					description: `Connect your ${platformLabel} account in the OpenQuok web app, add OpenQuok MCP to ${clientLabel} with an opo_ token, and ask in natural language to draft and schedule. Every post lands as a draft or scheduled item until you approve on the calendar or kanban.`
				};
			}
			if (
				item.title === `What is OpenQuok MCP for ${clientLabel}?` ||
				item.title.startsWith('What is OpenQuok MCP')
			) {
				return {
					...item,
					title: `What is OpenQuok MCP for ${platformLabel} on ${clientLabel}?`,
					description: `OpenQuok exposes ${platformLabel} scheduling tools over MCP so ${clientLabel} can list your connected account, read platform limits, and draft or schedule ${platformLabel} posts in natural language — you approve what publishes in your OpenQuok workspace.`
				};
			}
			return item;
		})
	};
}
