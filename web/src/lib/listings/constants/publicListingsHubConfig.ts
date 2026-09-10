import type { PublicFaqItem } from '$lib/content/constants/publicFaqConfig';

import { faqHrefAgent, faqLink, publicFaqHref } from '$lib/content/utils/publicFaqLinks';

export type PublicListingsHubFaqSection = {
	faqSubtitle: string;
	faqTitle: string;
	faqDescription: string;
	faqItems: readonly PublicFaqItem[];
};

export type PublicListingsHubConfig = {
	/** Eyebrow label above the H1. */
	subtitle: string;
	/** H1 and `<title>` tag headline before the company suffix. */
	title: string;
	/** Long-tail H1 / meta title suffix for category and tag filter pages. */
	filterPageTitleSuffix: string;
	/** Short lead copy for the hero and meta description. */
	description: string;
	/** Meta keywords passed to `createMetaData`. */
	seoKeywords: readonly string[];
	faqSection: PublicListingsHubFaqSection;
};

export const PUBLIC_BUILDING_BLOCKS_HUB = {
	subtitle: 'Building Blocks',
	title: 'Social Media Scheduler Skills & MCP Servers',
	filterPageTitleSuffix: 'Scheduler Skills & MCP Servers',
	description:
		'Install skills and MCP servers to schedule social posts from Cursor, Claude, OpenClaw, and the CLI — browse OpenQuok Core and catalog building blocks for drafting, queuing, and approving content on your calendar.',
	seoKeywords: [
		'social media scheduler MCP server',
		'schedule social media posts from Cursor',
		'OpenQuok MCP social scheduling',
		'social media scheduling CLI skill',
		'MCP tools for social media marketing',
		'install social media scheduler on Claude',
		'schedule Threads posts MCP',
		'schedule Instagram posts MCP',
		'AI social media scheduling MCP',
		'social media automation skills for agents',
		'AI agent skills directory',
		'MCP server catalog',
		'agent skills for Claude',
		'Cursor MCP extensions',
		'OpenClaw skills',
		'Codex MCP tools',
		'Model Context Protocol servers',
		'agent building blocks',
		'SKILL.md generator',
		'AI agent tools marketplace'
	],
	faqSection: {
		faqSubtitle: 'Building blocks FAQ',
		faqTitle: 'Social scheduling skills, MCP servers, and building blocks explained',
		faqDescription:
			'What building blocks are, how they help you schedule social posts, how skills differ from MCP servers, and how they connect to playbooks and Skill Builder on OpenQuok.',
		faqItems: [
			{
				title: 'What is a building block in OpenQuok?',
				description:
					`A building block is an installable agent extension — usually a skill (SKILL.md), an MCP server, or both. Each entry includes install commands, setup docs, and tool definitions so you can add capabilities to Claude, Cursor, Codex, OpenClaw, Hermes, and other hosts. Browse ${faqLink(publicFaqHref.buildingBlocks, 'Building Blocks')} or filter by tag on ${faqLink(publicFaqHref.agents, 'Agents')}.`
			},
			{
				title: 'How do building blocks help me schedule social posts?',
				description:
					`Install OpenQuok Core as an MCP server in ${faqLink(publicFaqHref.cursorLanding, 'Cursor')} or as a skill on ${faqLink(faqHrefAgent('openclaw'), 'OpenClaw')} and ${faqLink(faqHrefAgent('hermes'), 'Hermes')}, then ask your assistant to list integrations and queue posts — or use the ${faqLink(publicFaqHref.cliSetupGuides, 'CLI')} for scripted batches. ${faqLink(publicFaqHref.signUp, 'Sign up')}, connect channels on ${faqLink(publicFaqHref.channels, 'Channels')}, and approve everything on the calendar before publish. Chain blocks into ${faqLink(publicFaqHref.playbooks, 'playbooks')} for full marketing workflows.`
			},
			{
				title: 'What is the difference between a skill and an MCP server?',
				description:
					`Skills package instructions and commands agents read from SKILL.md — common on ${faqLink(faqHrefAgent('openclaw'), 'OpenClaw')}, ${faqLink(faqHrefAgent('hermes'), 'Hermes')}, and skill-based hosts. MCP servers expose tools over the Model Context Protocol for editors and terminals like ${faqLink(publicFaqHref.cursorLanding, 'Cursor')}, Claude Code, and Codex. Some listings ship both so you can pick the install path that matches your agent. See ${faqLink(publicFaqHref.agentSetupGuides, 'agent setup guides')} and ${faqLink(publicFaqHref.mcpSetupGuides, 'MCP setup guides')}.`
			},
			{
				title: 'How do I install a building block or combine several into one skill?',
				description:
					`Open a listing on ${faqLink(publicFaqHref.buildingBlocks, 'Building Blocks')}, expand the card, and copy the skill install command or MCP server config for your platform. Each entry links to a setup guide with transport details (stdio, HTTP, or SSE), auth steps, and environment variables. To merge multiple blocks, select Add to skill builder and open ${faqLink(publicFaqHref.skillBuilderTool, 'Skill Builder')} for a single SKILL.md export.`
			}
		]
	}
} satisfies PublicListingsHubConfig;

export const PUBLIC_PLAYBOOKS_HUB = {
	subtitle: 'Playbooks',
	title: 'Social Media Scheduling Playbooks',
	filterPageTitleSuffix: 'Scheduling Playbooks',
	description:
		'Browse step-by-step marketing playbooks for drafting, batching, and scheduling social posts — viral formats, content calendars, and cross-platform workflows you run on OpenQuok and approve before anything goes live.',
	seoKeywords: [
		'social media scheduling playbooks',
		'social media marketing workflow templates',
		'schedule social media posts step by step',
		'viral social media content playbooks',
		'cross-platform social media scheduling',
		'TikTok carousel scheduling playbook',
		'Threads posting workflow template',
		'Instagram content scheduling playbook',
		'social media automation for marketers',
		'AI social media scheduler workflows',
		'AI agent workflow templates',
		'agent playbook directory',
		'reusable agent automations',
		'skills and MCP workflows',
		'step-by-step agent workflows',
		'Claude agent playbooks',
		'Cursor workflow templates',
		'OpenClaw automation playbooks',
		'agent orchestration templates',
		'AI automation playbooks'
	],
	faqSection: {
		faqSubtitle: 'Playbooks FAQ',
		faqTitle: 'Social media scheduling agent playbooks and workflows explained',
		faqDescription:
			'What marketing playbooks are, how they help you schedule social posts, how they differ from building blocks, and how to publish your own workflow on OpenQuok.',
		faqItems: [
			{
				title: 'What is a social media scheduling playbook?',
				description:
					`A playbook is a published, step-by-step workflow on OpenQuok that walks you from idea to scheduled post — viral formats, carousel batches, reply chains, and content-calendar queues you can rerun. Each playbook chains building blocks (skills and MCP tools) into an ordered sequence for the CLI, MCP chat, or your agent. Browse ${faqLink(publicFaqHref.playbooks, 'Playbooks')} or filter by platform tag.`
			},
			{
				title: 'How do playbooks help me schedule social posts?',
				description:
					`Playbooks encode repeatable marketing workflows: draft copy, format per platform, queue on the calendar, and approve before publish. Run OpenQuok Core from the ${faqLink(publicFaqHref.cliSetupGuides, 'CLI getting started guide')} or MCP in ${faqLink(publicFaqHref.cursorLanding, 'Cursor')}, connect channels on ${faqLink(publicFaqHref.channels, 'Channels')}, then follow the playbook steps to batch weeks of content in one session.`
			},
			{
				title: 'How are playbooks different from building blocks?',
				description:
					`Building blocks are single installable capabilities — one skill or MCP server from ${faqLink(publicFaqHref.buildingBlocks, 'Building Blocks')}. Playbooks compose multiple blocks in order with context about when and why to run each step. Start with a playbook when you want a turnkey scheduling workflow; start with building blocks when you want to assemble your own in ${faqLink(publicFaqHref.skillBuilderTool, 'Skill Builder')}.`
			},
			{
				title: 'Which social platforms do playbooks cover?',
				description:
					`Filter ${faqLink(publicFaqHref.playbooks, 'Playbooks')} by tag for Threads, TikTok, Instagram, YouTube, LinkedIn, X, and other networks on ${faqLink(publicFaqHref.channels, 'Channels')}. Each channel landing page links platform-specific playbooks and scheduling features. ${faqLink(publicFaqHref.signUp, 'Sign up for free')} to connect accounts and approve drafts on the calendar before anything goes live.`
			}
		]
	}
} satisfies PublicListingsHubConfig;
