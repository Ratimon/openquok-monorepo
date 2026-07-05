import type { PublicFaqItem } from '$lib/content/constants/publicFaqConfig';

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
	title: 'All Skills & MCP Servers',
	filterPageTitleSuffix: 'Skills & MCP Servers',
	description: 'Browse installable skills and MCP servers for Claude, Cursor, OpenClaw, and other AI agents.',
	seoKeywords: [
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
		faqTitle: 'Agent skills, MCP servers, and building blocks explained',
		faqDescription:
			'What building blocks are, how skills differ from MCP servers, where to install them, and how they connect to playbooks and Skill Builder on OpenQuok.',
		faqItems: [
			{
				title: 'What is a building block in OpenQuok?',
				description:
					'A building block is an installable agent extension listed in the OpenQuok catalog — usually a skill (SKILL.md), an MCP server, or both. Each entry includes install commands, setup docs, and tool definitions so you can add capabilities to Claude, Cursor, Codex, OpenClaw, Hermes, and other agent hosts without writing integration code from scratch.'
			},
			{
				title: 'What is the difference between a skill and an MCP server?',
				description:
					'Skills package instructions and commands agents read from SKILL.md — common on OpenClaw, Hermes, and skill-based hosts. MCP servers expose tools over the Model Context Protocol for editors and terminals like Cursor, Claude Code, and Codex. Some listings ship both so you can pick the install path that matches your agent.'
			},
			{
				title: 'How do I install a building block on my agent?',
				description:
					'Open a listing, expand the card, and copy the skill install command or MCP server config for your platform. Each entry links to a setup guide with transport details (stdio, HTTP, or SSE), auth steps, and environment variables. Official OpenQuok Core covers both paths from one listing.'
			},
			{
				title: 'Can I combine multiple building blocks into one skill?',
				description:
					'Yes. Select building blocks on this page with Add to skill builder, then open Skill Builder to merge them into a single SKILL.md export. That workflow is useful when you want one agent skill that references several MCP tools or third-party capabilities.'
			},
		]
	}
} satisfies PublicListingsHubConfig;

export const PUBLIC_PLAYBOOKS_HUB = {
	subtitle: 'Playbooks',
	title: 'All Agent Playbooks',
	filterPageTitleSuffix: 'Agent Playbooks',
	description:
		'Ready-made workflows that combine skills and MCP building blocks into steps your agents can run again and again.',
	seoKeywords: [
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
		faqTitle: 'Agent playbooks, workflows, and templates explained',
		faqDescription:
			'What playbooks are, how they differ from individual building blocks, how to rerun workflows, and how to publish your own playbook on OpenQuok.',
		faqItems: [
			{
				title: 'What is an agent playbook?',
				description:
					'A playbook is a published, step-by-step workflow on OpenQuok that combines one or more building blocks — skills and MCP tools — into a sequence your agent can follow. Think of it as a reusable automation template rather than a single installable tool.'
			},
			{
				title: 'How are playbooks different from building blocks?',
				description:
					'Building blocks are atomic capabilities: one skill or MCP server you install on an agent. Playbooks orchestrate multiple blocks in order with context about when and why to run each step. Start with playbooks when you want a turnkey workflow; start with building blocks when you want to assemble your own.'
			},
			{
				title: 'How do I create and publish my own playbook?',
				description:
					'Sign in, set a public username, and submit a playbook from your account or assemble building blocks in Skill Builder first. The publish guide covers listing metadata, categories, tags, and review steps so your workflow appears in this directory.'
			},
			{
				title: 'Which agents support OpenQuok playbooks?',
				description:
					'Any agent that can run the skills or MCP building blocks referenced in a playbook works — including OpenClaw, Hermes, Claude Code, Cursor, Codex, and other MCP clients. Open each playbook to see which building blocks it uses and follow the linked setup guides for your platform.'
			}
		]
	}
} satisfies PublicListingsHubConfig;
